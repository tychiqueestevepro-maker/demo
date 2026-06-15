"use server";

import { ApiError, getServerUser } from "@/lib/auth";
import { MAX_ACCOUNT_STORAGE_BYTES, MAX_DOCUMENT_BYTES } from "@/lib/account-limits";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type DataSourceDraftInput = {
  title: string;
  type: string;
  url?: string;
  description?: string;
  fileSizeBytes?: number;
  campaignId: string;
  targetId?: string;
};

export async function addDataSource(data: DataSourceDraftInput) {
  const { userId } = await getServerUser();
  const fileSizeBytes = data.fileSizeBytes ?? 0;

  if (fileSizeBytes > MAX_DOCUMENT_BYTES) {
    throw new ApiError(400, "Document limit exceeded. Each imported document must be 25 MB or less.");
  }

  const storage = await prisma.dataSource.aggregate({
    where: { userId },
    _sum: { fileSizeBytes: true },
  });

  if ((storage._sum.fileSizeBytes ?? 0) + fileSizeBytes > MAX_ACCOUNT_STORAGE_BYTES) {
    throw new ApiError(400, "Account storage limit exceeded. Each account can store up to 1 GB.");
  }

  const newSource = await prisma.dataSource.create({
    data: {
      userId,
      title: data.title,
      type: mapDataSourceType(data.type),
      url: data.url,
      description: data.description,
      fileSizeBytes,
      campaignId: data.campaignId,
      targetId: data.targetId || null,
      importance: "MEDIUM",
      lastCheckedAt: new Date(),
    },
  });

  revalidatePath("/app/data-directory");
  if (data.targetId) {
    revalidatePath(`/app/campaigns/${data.campaignId}/targets/${data.targetId}`);
  }
  return newSource;
}

export async function deleteDataSource(id: string) {
  const { userId } = await getServerUser();

  await prisma.dataSource.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/app/data-directory");
}

function mapDataSourceType(type: string) {
  if (type === "Link") return "CUSTOM_LINK";
  if (type === "Note") return "NOTE";
  if (type === "Email thread") return "EMAIL_THREAD";
  if (type === "Invoice") return "INVOICE";
  if (type === "Contract") return "CONTRACT";
  if (type === "Drive folder") return "GOOGLE_DRIVE";
  if (type === "Spreadsheet") return "SPREADSHEET";

  return "DOCUMENT";
}
