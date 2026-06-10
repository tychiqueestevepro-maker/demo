import { ActivityType } from "@prisma/client";

import { assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import type { UpdateCreateInput } from "@/lib/validators";

export async function listCampaignUpdates(userId: string, campaignId: string) {
  assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);
  return prisma.update.findMany({
    where: { userId, campaignId },
    orderBy: { createdAt: "desc" },
    include: { target: true },
  });
}

export async function addUpdateAndRefreshSummary(userId: string, campaignId: string, input: UpdateCreateInput) {
  assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);

  if (input.targetId) {
    assertOwned(await prisma.campaignTarget.findUnique({ where: { id: input.targetId } }), userId);
  }

  const update = await prisma.update.create({
    data: {
      ...input,
      userId,
      campaignId,
    },
  });

  // Future AI integration point: extract structured actions and refresh summaries after new updates.
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      aiSummary: `Latest update: ${input.content.slice(0, 240)}`,
    },
  });

  await createActivityLog({
    userId,
    campaignId,
    targetId: input.targetId,
    type: ActivityType.UPDATE_ADDED,
    message: "Campaign update was added.",
  });

  return update;
}

export async function listTargetUpdates(userId: string, targetId: string) {
  const target = assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);
  return prisma.update.findMany({
    where: { userId, campaignId: target.campaignId, targetId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addTargetUpdate(userId: string, targetId: string, input: Omit<UpdateCreateInput, "targetId">) {
  const target = assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);
  return addUpdateAndRefreshSummary(userId, target.campaignId, { ...input, targetId });
}

