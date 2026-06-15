import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { MAX_ACCOUNT_STORAGE_BYTES, MAX_DOCUMENT_BYTES } from "@/lib/account-limits";
import { ApiError, assertOwned, requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addDataSource, getAccountStorageUsage } from "@/lib/services/data-source-service";

export const runtime = "nodejs";

const BUCKET_NAME = "documents";
const STORAGE_URL_PREFIX = `storage://${BUCKET_NAME}/`;

export async function POST(request: NextRequest) {
  let uploadedPath: string | null = null;

  try {
    const { userId } = await requireAuthenticatedUser(request);
    const formData = await readFormData(request);
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(400, "A document file is required.");
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      throw new ApiError(400, "Document limit exceeded. Each imported document must be 25 MB or less.");
    }

    const usage = await getAccountStorageUsage(userId);
    if (usage.usedBytes + file.size > MAX_ACCOUNT_STORAGE_BYTES) {
      throw new ApiError(400, "Account storage limit exceeded. Each account can store up to 1 GB.");
    }

    const targetId = getOptionalString(formData, "targetId");
    let campaignId = getOptionalString(formData, "campaignId");

    if (targetId) {
      const target = assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);
      campaignId = target.campaignId;
    } else if (campaignId) {
      assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);
    } else {
      throw new ApiError(400, "A campaign or prospect is required.");
    }

    const supabase = getServiceClient();
    const path = `${userId}/${targetId ?? campaignId}/${randomUUID()}-${sanitizeFileName(file.name)}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      throw new ApiError(500, `Failed to upload document: ${uploadError.message}`);
    }

    uploadedPath = path;

    const source = await addDataSource(userId, {
      campaignId,
      targetId,
      title: getOptionalString(formData, "title") ?? file.name,
      type: mapDataSourceType(getOptionalString(formData, "type"), file.name),
      url: `${STORAGE_URL_PREFIX}${path}`,
      description: getOptionalString(formData, "description") ?? `${file.name} uploaded for this prospect.`,
      fileSizeBytes: file.size,
    });

    return ok(source, 201);
  } catch (error) {
    if (uploadedPath) {
      await removeUploadedFile(uploadedPath);
    }
    return handleApiError(error);
  }
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new ApiError(500, "Supabase service role key is required for document storage.");
  }

  return createClient(url, serviceKey);
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function mapDataSourceType(type: string | undefined, fileName: string) {
  const normalized = (type ?? "").toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  if (normalized.includes("invoice") || lowerFileName.includes("invoice")) return "INVOICE";
  if (normalized.includes("contract") || lowerFileName.includes("contract")) return "CONTRACT";
  if (normalized.includes("email")) return "EMAIL_THREAD";
  if (normalized.includes("note")) return "NOTE";
  if (normalized.includes("link")) return "CUSTOM_LINK";
  if (lowerFileName.endsWith(".csv") || lowerFileName.endsWith(".xls") || lowerFileName.endsWith(".xlsx")) return "SPREADSHEET";

  return "DOCUMENT";
}

async function removeUploadedFile(path: string) {
  try {
    await getServiceClient().storage.from(BUCKET_NAME).remove([path]);
  } catch {
    // Best-effort cleanup after a database failure.
  }
}

async function readFormData(request: NextRequest) {
  try {
    return await request.formData();
  } catch {
    throw new ApiError(400, "Upload requests must use multipart form data.");
  }
}
