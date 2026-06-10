import { addDays } from "date-fns";
import { ActivityType, Prisma, StageType } from "@prisma/client";

import { ApiError, assertOwned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createActivityLog } from "@/lib/services/activity-service";
import { generatePlaybook } from "@/lib/services/ai-service";
import type { GeneratePlaybookInput } from "@/lib/validators";

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function generateCampaignPlaybook(userId: string, input: GeneratePlaybookInput) {
  if (!input.campaignId) {
    return generatePlaybook(input);
  }

  const campaign = assertOwned(
    await prisma.campaign.findUnique({
      where: { id: input.campaignId },
      include: {
        targets: {
          take: 20,
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
          select: {
            name: true,
            company: true,
            role: true,
            status: true,
            priority: true,
            notes: true,
            aiSummary: true,
          },
        },
        dataSources: {
          take: 20,
          orderBy: { updatedAt: "desc" },
          select: {
            title: true,
            type: true,
            description: true,
            importance: true,
          },
        },
      },
    }),
    userId,
  );

  const aiOutput = await generatePlaybook({
    ...input,
    type: campaign.type,
    goal: input.goal || campaign.goal,
    context: input.context ?? campaign.description,
    targetAudience: input.targetAudience ?? campaign.targetAudience,
    urgency: input.urgency ?? campaign.urgency,
    tone: input.tone ?? campaign.tone,
    channel: input.channel ?? campaign.channel,
  });

  const playbook = await prisma.campaignPlaybook.create({
    data: {
      userId,
      campaignId: campaign.id,
      name: `${campaign.name} playbook`,
      description: aiOutput.campaignLogic.chosenApproach,
      campaignSummary: aiOutput.campaignSummary,
      campaignLogic: asJson(aiOutput.campaignLogic),
      recommendedStatuses: asJson(aiOutput.recommendedStatuses),
      rules: asJson(aiOutput.rules),
      risks: asJson(aiOutput.risks),
      setupSuggestions: asJson(aiOutput.setupSuggestions),
      rawAiOutput: asJson(aiOutput),
      escalationLogic: aiOutput.escalationLogic,
      stopCondition: aiOutput.stopCondition,
      successCondition: aiOutput.successCondition,
      generatedByAi: true,
      stages: {
        create: aiOutput.stages.map((stage) => ({
          userId,
          campaignId: campaign.id,
          order: stage.order,
          name: stage.name,
          type: stage.type,
          goalOfStage: stage.goalOfStage,
          delayDays: stage.delayDays,
          condition: stage.condition,
          messageSubject: stage.messageSubject,
          messageBody: stage.messageBody,
          recommendedChannel: stage.recommendedChannel,
          whyThisMessage: stage.whyThisMessage,
          nextStatus: stage.nextStatus,
          aiMetadata: asJson({
            whyThisMessage: stage.whyThisMessage,
            recommendedChannel: stage.recommendedChannel,
            nextStatus: stage.nextStatus,
          }),
          tone: input.tone ?? campaign.tone,
          isFinal: stage.type === StageType.FINAL,
          requiresEscalation: stage.type === StageType.ESCALATION,
        })),
      },
    },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  await createActivityLog({
    userId,
    campaignId: campaign.id,
    type: ActivityType.PLAYBOOK_GENERATED,
    message: "Campaign playbook generated with OpenAI structured output. No outbound messages were sent.",
    metadata: {
      provider: "openai",
      pressureLevel: aiOutput.campaignLogic.pressureLevel,
      stageCount: aiOutput.stages.length,
    },
  });

  return playbook;
}

export async function createFollowUpsFromPlaybook(userId: string, campaignId: string) {
  const campaign = assertOwned(
    await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        targets: true,
        playbooks: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { stages: { orderBy: { order: "asc" } } },
        },
      },
    }),
    userId,
  );

  const playbook = campaign.playbooks[0];
  if (!playbook) {
    throw new ApiError(400, "Campaign has no playbook.");
  }

  const initialStage = playbook.stages[0];
  if (!initialStage) {
    throw new ApiError(400, "Playbook has no stages.");
  }

  return prisma.followUp.createMany({
    data: campaign.targets.map((target) => ({
      userId,
      campaignId,
      targetId: target.id,
      stageId: initialStage.id,
      dueAt: addDays(new Date(), initialStage.delayDays),
      messageSubject: initialStage.messageSubject,
      messageBody: initialStage.messageBody,
      reason: "Created from campaign playbook launch. The user still sends manually.",
      priority: target.priority,
    })),
  });
}

