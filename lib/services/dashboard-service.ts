import { endOfDay, startOfDay } from "date-fns";
import { CampaignStatus, FollowUpStatus, TargetStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function getDashboard(userId: string) {
  const [activeCampaigns, dueFollowUps, blockedTargets, recentUpdates, campaignsNeedingReview] = await Promise.all([
    prisma.campaign.count({ where: { userId, status: CampaignStatus.ACTIVE } }),
    prisma.followUp.count({
      where: {
        userId,
        status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE, FollowUpStatus.COPIED] },
        dueAt: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
      },
    }),
    prisma.campaignTarget.count({
      where: { userId, status: { in: [TargetStatus.OVERDUE, TargetStatus.ESCALATION_DUE, TargetStatus.ESCALATED] } },
    }),
    prisma.update.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { campaign: true, target: true },
    }),
    prisma.campaign.findMany({
      where: { userId, status: { in: [CampaignStatus.BLOCKED, CampaignStatus.WAITING] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    activeCampaigns,
    dueFollowUps,
    blockedTargets,
    recentUpdates,
    campaignsNeedingReview,
    aiBriefing: {
      summary: "Start with due follow-ups, then clear blocked targets and review waiting campaigns.",
      generatedBy: "local-placeholder",
    },
  };
}

