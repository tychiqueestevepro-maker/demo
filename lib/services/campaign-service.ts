import { ActivityType, CampaignStatus } from "@prisma/client";

import { ApiError, assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import { createFollowUpsFromPlaybook } from "@/lib/services/playbook-service";
import type { CampaignCreateInput, CampaignPatchInput } from "@/lib/validators";

export async function listCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: { userId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { targets: true, followUps: true } },
    },
  });
}

export async function createCampaign(userId: string, input: CampaignCreateInput) {
  const campaign = await prisma.campaign.create({
    data: {
      ...input,
      userId,
      status: input.status ?? CampaignStatus.DRAFT,
    },
  });

  await createActivityLog({
    userId,
    campaignId: campaign.id,
    type: ActivityType.CAMPAIGN_CREATED,
    message: `${campaign.name} was created.`,
  });

  return campaign;
}

export async function getCampaign(userId: string, id: string) {
  return assertOwned(
    await prisma.campaign.findUnique({
      where: { id },
      include: {
        targets: true,
        playbooks: { include: { stages: { orderBy: { order: "asc" } } } },
        followUps: true,
        dataSources: true,
        updates: { orderBy: { createdAt: "desc" } },
        activityLogs: { orderBy: { createdAt: "desc" } },
      },
    }),
    userId,
  );
}

export async function updateCampaign(userId: string, id: string, input: CampaignPatchInput) {
  assertOwned(await prisma.campaign.findUnique({ where: { id } }), userId);

  const campaign = await prisma.campaign.update({
    where: { id },
    data: input,
  });

  await createActivityLog({
    userId,
    campaignId: id,
    type: ActivityType.CAMPAIGN_UPDATED,
    message: `${campaign.name} was updated.`,
  });

  return campaign;
}

export async function deleteCampaign(userId: string, id: string) {
  const campaign = assertOwned(await prisma.campaign.findUnique({ where: { id } }), userId);
  await prisma.campaign.delete({ where: { id: campaign.id } });
}

export async function launchCampaign(userId: string, id: string) {
  const campaign = assertOwned(await prisma.campaign.findUnique({ where: { id } }), userId);

  if (campaign.status === CampaignStatus.ARCHIVED) {
    throw new ApiError(400, "Archived campaigns cannot be launched.");
  }

  await createFollowUpsFromPlaybook(userId, id);

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: CampaignStatus.ACTIVE, launchedAt: new Date() },
  });

  await createActivityLog({
    userId,
    campaignId: id,
    type: ActivityType.CAMPAIGN_LAUNCHED,
    message: `${updated.name} was launched. No outbound messages were sent automatically.`,
  });

  return updated;
}

export async function archiveCampaign(userId: string, id: string) {
  assertOwned(await prisma.campaign.findUnique({ where: { id } }), userId);
  return prisma.campaign.update({
    where: { id },
    data: { status: CampaignStatus.ARCHIVED, archivedAt: new Date() },
  });
}

export async function completeCampaign(userId: string, id: string) {
  assertOwned(await prisma.campaign.findUnique({ where: { id } }), userId);
  return prisma.campaign.update({
    where: { id },
    data: { status: CampaignStatus.COMPLETED },
  });
}

export async function calculateCampaignProgress(userId: string, campaignId: string) {
  const campaign = assertOwned(
    await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { targets: true },
    }),
    userId,
  );

  if (campaign.targets.length === 0) {
    return 0;
  }

  const completed = campaign.targets.filter((target) => ["COMPLETED", "STOPPED", "ARCHIVED"].includes(target.status)).length;
  return Math.round((completed / campaign.targets.length) * 100);
}

