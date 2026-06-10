import { ActivityType } from "@prisma/client";

import { assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import type { DataSourceCreateInput } from "@/lib/validators";

export async function listDataSources(userId: string) {
  return prisma.dataSource.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { campaign: true, target: true },
  });
}

export async function addDataSource(userId: string, input: DataSourceCreateInput) {
  await validateSourceScope(userId, input.campaignId, input.targetId);

  const source = await prisma.dataSource.create({
    data: {
      ...input,
      userId,
    },
  });

  if (source.campaignId) {
    await createActivityLog({
      userId,
      campaignId: source.campaignId,
      targetId: source.targetId,
      type: ActivityType.DATA_SOURCE_ADDED,
      message: `${source.title} was added as a user-provided source.`,
    });
  }

  return source;
}

export async function updateDataSource(userId: string, sourceId: string, input: Partial<DataSourceCreateInput>) {
  const source = assertOwned(await prisma.dataSource.findUnique({ where: { id: sourceId } }), userId);
  await validateSourceScope(userId, input.campaignId ?? source.campaignId, input.targetId ?? source.targetId);

  return prisma.dataSource.update({
    where: { id: source.id },
    data: input,
  });
}

export async function deleteDataSource(userId: string, sourceId: string) {
  const source = assertOwned(await prisma.dataSource.findUnique({ where: { id: sourceId } }), userId);
  await prisma.dataSource.delete({ where: { id: source.id } });
}

export async function listCampaignDataSources(userId: string, campaignId: string) {
  assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);
  return prisma.dataSource.findMany({
    where: { userId, campaignId },
    orderBy: { updatedAt: "desc" },
    include: { target: true },
  });
}

export async function listTargetDataSources(userId: string, targetId: string) {
  assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);
  return prisma.dataSource.findMany({
    where: { userId, targetId },
    orderBy: { updatedAt: "desc" },
    include: { campaign: true },
  });
}

async function validateSourceScope(userId: string, campaignId?: string | null, targetId?: string | null) {
  if (campaignId) {
    assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);
  }

  if (targetId) {
    assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);
  }
}

