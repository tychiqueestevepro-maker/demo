"use server";

import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addDataSource(data: {
  title: string;
  type: any;
  url?: string;
  description?: string;
  campaignId: string;
  targetId?: string;
}) {
  const { userId } = await getServerUser();

  const newSource = await prisma.dataSource.create({
    data: {
      userId,
      title: data.title,
      type: data.type === "Document" ? "DOCUMENT" : data.type === "Link" ? "CUSTOM_LINK" : data.type === "Note" ? "NOTE" : "DOCUMENT",
      url: data.url,
      description: data.description,
      campaignId: data.campaignId,
      targetId: data.targetId || null,
      importance: "MEDIUM",
      lastCheckedAt: new Date(),
    },
  });

  revalidatePath("/app/data-directory");
  return newSource;
}

export async function deleteDataSource(id: string) {
  const { userId } = await getServerUser();

  await prisma.dataSource.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/app/data-directory");
}
