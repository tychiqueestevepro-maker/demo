import { addDays, endOfDay, startOfDay } from "date-fns";
import { ActivityType, FollowUpStatus } from "@prisma/client";

import { assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import type { FollowUpPatchInput } from "@/lib/validators";

export async function listFollowUps(userId: string) {
  return prisma.followUp.findMany({
    where: { userId },
    orderBy: [{ dueAt: "asc" }, { priority: "desc" }],
    include: { campaign: true, target: true, stage: true },
  });
}

export async function listTodayFollowUps(userId: string) {
  return prisma.followUp.findMany({
    where: {
      userId,
      status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE, FollowUpStatus.COPIED] },
      dueAt: {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date()),
      },
    },
    orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
    include: { campaign: true, target: true, stage: true },
  });
}

export async function updateFollowUp(userId: string, followUpId: string, input: FollowUpPatchInput) {
  const followUp = assertOwned(await prisma.followUp.findUnique({ where: { id: followUpId } }), userId);
  return prisma.followUp.update({
    where: { id: followUp.id },
    data: input,
  });
}

export async function snoozeFollowUp(userId: string, followUpId: string, dueAt = addDays(new Date(), 1)) {
  const followUp = assertOwned(await prisma.followUp.findUnique({ where: { id: followUpId } }), userId);

  const updated = await prisma.followUp.update({
    where: { id: followUp.id },
    data: { status: FollowUpStatus.SNOOZED, dueAt },
  });

  await createActivityLog({
    userId,
    campaignId: followUp.campaignId,
    targetId: followUp.targetId,
    type: ActivityType.FOLLOW_UP_SNOOZED,
    message: "Follow-up was snoozed.",
  });

  return updated;
}

export async function markFollowUpSent(userId: string, followUpId: string) {
  const followUp = assertOwned(await prisma.followUp.findUnique({ where: { id: followUpId } }), userId);

  const updated = await prisma.followUp.update({
    where: { id: followUp.id },
    data: { status: FollowUpStatus.SENT, sentAt: new Date() },
  });

  await createActivityLog({
    userId,
    campaignId: followUp.campaignId,
    targetId: followUp.targetId,
    type: ActivityType.MESSAGE_MARKED_SENT,
    message: "Follow-up was marked sent manually.",
  });

  return updated;
}

export async function markFollowUpCopied(userId: string, followUpId: string) {
  const followUp = assertOwned(await prisma.followUp.findUnique({ where: { id: followUpId } }), userId);

  const updated = await prisma.followUp.update({
    where: { id: followUp.id },
    data: { status: FollowUpStatus.COPIED, copiedAt: new Date() },
  });

  await createActivityLog({
    userId,
    campaignId: followUp.campaignId,
    targetId: followUp.targetId,
    type: ActivityType.MESSAGE_COPIED,
    message: "Follow-up message was copied. No outbound send occurred.",
  });

  return updated;
}

