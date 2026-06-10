import { parse } from "csv-parse/sync";
import { addDays } from "date-fns";
import { ActivityType, FollowUpStatus, TargetStatus } from "@prisma/client";

import { ApiError, assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import type { TargetCreateInput, TargetPatchInput } from "@/lib/validators";

export async function listTargets(userId: string, campaignId: string) {
  assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);
  return prisma.campaignTarget.findMany({
    where: { userId, campaignId },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    include: { currentStage: true, dataSources: true },
  });
}

export async function addTargets(userId: string, campaignId: string, input: TargetCreateInput | TargetCreateInput[]) {
  const campaign = assertOwned(await prisma.campaign.findUnique({ where: { id: campaignId } }), userId);
  const targets = Array.isArray(input) ? input : [input];

  const created = await prisma.$transaction(
    targets.map((target) =>
      prisma.campaignTarget.create({
        data: {
          ...target,
          userId,
          campaignId,
        },
      }),
    ),
  );

  await createActivityLog({
    userId,
    campaignId,
    type: ActivityType.TARGET_ADDED,
    message: `${created.length} target(s) added to ${campaign.name}.`,
  });

  return created;
}

export async function importTargetsFromCsv(userId: string, campaignId: string, csv: string) {
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const targets = records.map((record) => ({
    name: record.name,
    company: record.company || null,
    role: record.role || null,
    email: record.email || null,
    phone: record.phone || null,
    profileUrl: record.profileUrl || record.profile_url || null,
    customChannelUrl: record.customChannelUrl || record.custom_channel_url || null,
    notes: record.note || record.notes || null,
  }));

  return addTargets(userId, campaignId, targets);
}

export async function getTarget(userId: string, targetId: string) {
  return assertOwned(
    await prisma.campaignTarget.findUnique({
      where: { id: targetId },
      include: {
        campaign: true,
        currentStage: true,
        followUps: { orderBy: { dueAt: "asc" } },
        dataSources: true,
        updates: { orderBy: { createdAt: "desc" } },
        activityLogs: { orderBy: { createdAt: "desc" } },
      },
    }),
    userId,
  );
}

export async function updateTarget(userId: string, targetId: string, input: TargetPatchInput) {
  const target = assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);

  const updated = await prisma.campaignTarget.update({
    where: { id: target.id },
    data: input,
  });

  await createActivityLog({
    userId,
    campaignId: target.campaignId,
    targetId,
    type: ActivityType.TARGET_UPDATED,
    message: `${updated.name} was updated.`,
  });

  return updated;
}

export async function deleteTarget(userId: string, targetId: string) {
  const target = assertOwned(await prisma.campaignTarget.findUnique({ where: { id: targetId } }), userId);
  await prisma.campaignTarget.delete({ where: { id: target.id } });
}

export async function calculateTargetNextAction(userId: string, targetId: string) {
  const target = await getTarget(userId, targetId);
  const nextFollowUp = target.followUps.find((followUp) => ["PENDING", "DUE", "COPIED"].includes(followUp.status));

  if (target.status === TargetStatus.REPLIED) {
    return "Handle reply and choose whether to continue, stop, or complete.";
  }

  if (nextFollowUp) {
    return `Copy ${nextFollowUp.messageSubject ?? "next message"} and send manually.`;
  }

  return target.aiRecommendedAction ?? "Review target and choose next stage.";
}

export async function copyMessage(userId: string, targetId: string, followUpId?: string, stageId?: string) {
  const target = await getTarget(userId, targetId);
  const followUp = followUpId
    ? assertOwned(await prisma.followUp.findUnique({ where: { id: followUpId } }), userId)
    : await prisma.followUp.findFirst({ where: { userId, targetId, status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE] } }, orderBy: { dueAt: "asc" } });

  if (!followUp && !stageId) {
    throw new ApiError(404, "No message available to copy.");
  }

  if (followUp) {
    const updated = await prisma.followUp.update({
      where: { id: followUp.id },
      data: { status: FollowUpStatus.COPIED, copiedAt: new Date() },
    });

    await createActivityLog({
      userId,
      campaignId: target.campaignId,
      targetId,
      type: ActivityType.MESSAGE_COPIED,
      message: "Prepared message was copied. No outbound send occurred.",
    });

    return updated;
  }

  const stage = assertOwned(await prisma.playbookStage.findUnique({ where: { id: stageId } }), userId);
  return { messageSubject: stage.messageSubject, messageBody: stage.messageBody };
}

export async function markMessageSent(userId: string, targetId: string, followUpId?: string) {
  const target = await getTarget(userId, targetId);
  const followUp = followUpId
    ? assertOwned(await prisma.followUp.findUnique({ where: { id: followUpId } }), userId)
    : await prisma.followUp.findFirst({ where: { userId, targetId, status: { in: [FollowUpStatus.DUE, FollowUpStatus.COPIED, FollowUpStatus.PENDING] } }, orderBy: { dueAt: "asc" } });

  if (!followUp) {
    throw new ApiError(404, "No follow-up found.");
  }

  const updated = await prisma.followUp.update({
    where: { id: followUp.id },
    data: { status: FollowUpStatus.SENT, sentAt: new Date() },
  });

  await prisma.campaignTarget.update({
    where: { id: targetId },
    data: {
      status: target.followUpCount === 0 ? TargetStatus.INITIAL_SENT : TargetStatus.FOLLOW_UP_SENT,
      followUpCount: { increment: 1 },
      lastActionAt: new Date(),
      nextActionAt: addDays(new Date(), 3),
    },
  });

  await createActivityLog({
    userId,
    campaignId: target.campaignId,
    targetId,
    type: ActivityType.MESSAGE_MARKED_SENT,
    message: "Message was marked sent manually by the user.",
  });

  return updated;
}

export async function markTargetReplied(userId: string, targetId: string) {
  const target = await updateTarget(userId, targetId, { status: TargetStatus.REPLIED, lastActionAt: new Date() });
  await createActivityLog({
    userId,
    campaignId: target.campaignId,
    targetId,
    type: ActivityType.TARGET_REPLIED,
    message: `${target.name} was marked as replied.`,
  });
  return target;
}

export async function markTargetCompleted(userId: string, targetId: string) {
  const target = await updateTarget(userId, targetId, { status: TargetStatus.COMPLETED, lastActionAt: new Date() });
  await createActivityLog({
    userId,
    campaignId: target.campaignId,
    targetId,
    type: ActivityType.TARGET_COMPLETED,
    message: `${target.name} was marked completed.`,
  });
  return target;
}

export async function snoozeTarget(userId: string, targetId: string, dueAt: Date) {
  const target = await updateTarget(userId, targetId, { status: TargetStatus.WAITING, nextActionAt: dueAt });
  await prisma.followUp.updateMany({
    where: { userId, targetId, status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE, FollowUpStatus.COPIED] } },
    data: { status: FollowUpStatus.SNOOZED, dueAt },
  });
  return target;
}

export async function stopTarget(userId: string, targetId: string) {
  const target = await updateTarget(userId, targetId, { status: TargetStatus.STOPPED, lastActionAt: new Date() });
  await prisma.followUp.updateMany({
    where: { userId, targetId, status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE, FollowUpStatus.COPIED] } },
    data: { status: FollowUpStatus.CANCELLED, completedAt: new Date() },
  });
  return target;
}

export async function escalateTarget(userId: string, targetId: string) {
  return updateTarget(userId, targetId, { status: TargetStatus.ESCALATION_DUE, nextActionAt: new Date() });
}

export async function advanceTargetStage(userId: string, targetId: string, event: "sent" | "replied" | "completed" | "stopped") {
  if (event === "replied") return markTargetReplied(userId, targetId);
  if (event === "completed") return markTargetCompleted(userId, targetId);
  if (event === "stopped") return stopTarget(userId, targetId);
  await markMessageSent(userId, targetId);
  return getTarget(userId, targetId);
}

