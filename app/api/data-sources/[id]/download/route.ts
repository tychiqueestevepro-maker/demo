import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-response";
import { ApiError, assertOwned, requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const BUCKET_NAME = "documents";
const STORAGE_URL_PREFIX = `storage://${BUCKET_NAME}/`;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuthenticatedUser(request);
    const { id } = await params;
    const source = assertOwned(await prisma.dataSource.findUnique({ where: { id } }), userId);

    if (!source.url?.startsWith(STORAGE_URL_PREFIX)) {
      throw new ApiError(404, "Document file not found.");
    }

    const path = source.url.slice(STORAGE_URL_PREFIX.length);
    const supabase = getServiceClient();
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(path);

    if (error || !data) {
      throw new ApiError(500, `Failed to download document: ${error?.message ?? "Unknown error"}`);
    }

    return new Response(data, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${sanitizeDownloadFileName(source.title)}"`,
        "Content-Type": data.type || "application/octet-stream",
      },
    });
  } catch (error) {
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

function sanitizeDownloadFileName(fileName: string) {
  return fileName.replace(/["\r\n\\]/g, "_");
}
