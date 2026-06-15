import { parse } from "csv-parse/sync";
import { addDays } from "date-fns";
import { ActivityType, FollowUpStatus, TargetStatus } from "@prisma/client";

import { MAX_PROSPECTS_PER_CAMPAIGN } from "@/lib/account-limits";
import { ApiError, assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import type { TargetCreateInput, TargetPatchInput } from "@/lib/validators";
import { normalizeCsvRecord } from "@/lib/csv-utils";

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
  const playbook = await prisma.campaignPlaybook.findFirst({
    where: { userId, campaignId },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  const initialStage = playbook?.stages[0];

  const created = await prisma.$transaction(async (tx) => {
    const createdTargets = await tx.campaignTarget.createManyAndReturn({
      data: targets.map(target => ({
        ...target,
        userId,
        campaignId,
        currentStageId: target.currentStageId ?? initialStage?.id,
        followUpCount: 0,
        nextActionAt: target.nextActionAt ?? new Date(),
      }))
    });

    if (initialStage && createdTargets.length > 0) {
      await tx.followUp.createMany({
        data: createdTargets.map(createdTarget => ({
          userId,
          campaignId,
          targetId: createdTarget.id,
          stageId: initialStage.id,
          status: FollowUpStatus.PENDING,
          dueAt: new Date(),
          messageSubject: initialStage.messageSubject,
          messageBody: initialStage.messageBody,
          reason: initialStage.name,
          priority: createdTarget.priority,
        }))
      });
    }

    return createdTargets;
  }, {
    timeout: 30000, // 30 seconds to allow large CSV imports over slow network
  });

  await createActivityLog({
    userId,
    campaignId,
    type: ActivityType.TARGET_ADDED,
    message: `${created.length} target(s) added to ${campaign.name}.`,
  });

  return created;
}

export async function importTargetsFromCsv(userId: string, campaignId: string, csv: string) {
  const existingCount = await prisma.campaignTarget.count({ where: { userId, campaignId } });
  let records: Record<string, string>[];
  try {
    records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch (error) {
    throw new ApiError(400, "Invalid CSV format. Please check your data and try again.");
  }

  const targets = records
    .map(normalizeCsvRecord)
    .filter((target) => target.name);

  if (targets.length === 0) {
    throw new ApiError(400, "No valid prospects found. Add at least a name column.");
  }

  if (records.length > MAX_PROSPECTS_PER_CAMPAIGN) {
    throw new ApiError(400, `Import limit exceeded. Upload at most ${MAX_PROSPECTS_PER_CAMPAIGN} prospect rows at once.`);
  }

  if (existingCount + targets.length > MAX_PROSPECTS_PER_CAMPAIGN) {
    const remaining = Math.max(MAX_PROSPECTS_PER_CAMPAIGN - existingCount, 0);
    throw new ApiError(400, `Campaign prospect limit exceeded. This campaign can import ${remaining} more prospect(s).`);
  }

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

  const playbook = await prisma.campaignPlaybook.findFirst({
    where: { userId, campaignId: target.campaignId },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  const nextStep = target.followUpCount + 1;
  const nextStage = playbook?.stages[nextStep];
  const nextDueAt = addDays(new Date(), nextStage?.delayDays && nextStage.delayDays > 0 ? nextStage.delayDays : 2);

  const updated = followUp
    ? await prisma.followUp.update({
        where: { id: followUp.id },
        data: { status: FollowUpStatus.SENT, sentAt: new Date(), completedAt: new Date() },
      })
    : null;

  const updatedTarget = await prisma.campaignTarget.update({
    where: { id: targetId },
    data: {
      status: target.followUpCount === 0 ? TargetStatus.INITIAL_SENT : TargetStatus.FOLLOW_UP_SENT,
      followUpCount: nextStep,
      currentStageId: nextStage?.id ?? target.currentStageId,
      lastActionAt: new Date(),
      nextActionAt: nextStage ? nextDueAt : null,
      aiRecommendedAction: nextStage ? `Wait until next follow-up is due, then review ${nextStage.name}.` : "No more playbook steps. Validate or reject this prospect.",
    },
  });

  if (nextStage) {
    await prisma.followUp.create({
      data: {
        userId,
        campaignId: target.campaignId,
        targetId,
        stageId: nextStage.id,
        status: FollowUpStatus.PENDING,
        dueAt: nextDueAt,
        messageSubject: nextStage.messageSubject,
        messageBody: nextStage.messageBody,
        reason: nextStage.name,
        priority: target.priority,
      },
    });
  }

  await createActivityLog({
    userId,
    campaignId: target.campaignId,
    targetId,
    type: ActivityType.MESSAGE_MARKED_SENT,
    message: "Message was marked sent manually by the user.",
  });

  return updated ?? updatedTarget;
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

export async function advanceDueTargetSteps(now = new Date()) {
  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      status: FollowUpStatus.PENDING,
      dueAt: { lte: now },
      target: {
        status: {
          notIn: [TargetStatus.REPLIED, TargetStatus.INTERESTED, TargetStatus.COMPLETED, TargetStatus.STOPPED, TargetStatus.ARCHIVED, TargetStatus.NOT_INTERESTED],
        },
      },
    },
    include: { target: true, stage: true },
  });

  const advanced = [];

  for (const followUp of dueFollowUps) {
    const nextStep = followUp.target.followUpCount + 1;

    const [, target] = await prisma.$transaction([
      prisma.followUp.update({
        where: { id: followUp.id },
        data: { status: FollowUpStatus.DUE },
      }),
      prisma.campaignTarget.update({
        where: { id: followUp.targetId },
        data: {
          status: TargetStatus.FOLLOW_UP_DUE,
          followUpCount: nextStep,
          currentStageId: followUp.stageId,
          nextActionAt: followUp.dueAt,
          aiRecommendedAction: followUp.stage ? `Review and send ${followUp.stage.name}.` : "Review and send the next follow-up.",
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: followUp.userId,
          campaignId: followUp.campaignId,
          targetId: followUp.targetId,
          type: ActivityType.TARGET_UPDATED,
          message: `${followUp.target.name} moved to step ${nextStep}.`,
        },
      }),
    ]);

    advanced.push(target);
  }

  return advanced;
}
