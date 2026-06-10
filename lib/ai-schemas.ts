import { StageType } from "@prisma/client";
import { z } from "zod";

export const pressureLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const priorityLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const playbookStageOutputSchema = z
  .object({
    order: z.number().int().min(1),
    name: z.string().min(1),
    type: z.enum(StageType),
    goalOfStage: z.string().min(1),
    delayDays: z.number().int().min(0),
    condition: z.string().min(1),
    messageSubject: z.string().min(1),
    messageBody: z.string().min(1),
    recommendedChannel: z.string().min(1),
    whyThisMessage: z.string().min(1),
    nextStatus: z.string().min(1),
  })
  .strict();

export const campaignPlaybookOutputSchema = z
  .object({
    campaignSummary: z.string().min(1),
    campaignLogic: z
      .object({
        reasoning: z.string().min(1),
        chosenApproach: z.string().min(1),
        whyThisStructureFits: z.string().min(1),
        pressureLevel: pressureLevelSchema,
        riskIfNoResponse: z.string().min(1),
        humanControlNotes: z.string().min(1),
      })
      .strict(),
    recommendedStatuses: z.array(z.string().min(1)),
    stages: z.array(playbookStageOutputSchema).min(1).max(8),
    rules: z.array(
      z
        .object({
          if: z.string().min(1),
          then: z.string().min(1),
          reason: z.string().min(1),
        })
        .strict(),
    ),
    escalationLogic: z.string().min(1),
    stopCondition: z.string().min(1),
    successCondition: z.string().min(1),
    risks: z.array(z.string().min(1)),
    setupSuggestions: z.array(z.string().min(1)),
  })
  .strict();

export const recommendedMessageSchema = z
  .object({
    subject: z.string().min(1),
    body: z.string().min(1),
    recommendedChannel: z.string().min(1),
    whyThisMessage: z.string().min(1),
  })
  .strict();

export const targetSummaryOutputSchema = z
  .object({
    targetSummary: z.string().min(1),
    currentSituation: z.string().min(1),
    whyThisTargetMatters: z.string().min(1),
    lastKnownInteraction: z.string().min(1),
    blocker: z.string().min(1),
    recommendedNextAction: z.string().min(1),
    recommendedMessage: recommendedMessageSchema,
    priority: priorityLevelSchema,
    risk: z.string().min(1),
    dataSourcesToCheck: z.array(z.string().min(1)),
  })
  .strict();

export const campaignSummaryOutputSchema = z
  .object({
    campaignSummary: z.string().min(1),
    progress: z.string().min(1),
    mainBlockers: z.array(z.string().min(1)),
    hotTargets: z.array(z.string().min(1)),
    followUpsDue: z.array(z.string().min(1)),
    dataSourcesWorthChecking: z.array(z.string().min(1)),
    nextPriorities: z.array(z.string().min(1)),
    riskLevel: riskLevelSchema,
  })
  .strict();

export const dataSourceClassificationOutputSchema = z
  .object({
    sourceType: z.string().min(1),
    description: z.string().min(1),
    scope: z.enum(["CAMPAIGN", "TARGET"]),
    importance: z.enum(["LOW", "MEDIUM", "HIGH"]),
    whyItMatters: z.string().min(1),
    suggestedLabel: z.string().min(1),
  })
  .strict();

export const updateExtractionOutputSchema = z
  .object({
    summary: z.string().min(1),
    decisions: z.array(z.string().min(1)),
    actions: z.array(z.string().min(1)),
    peopleMentioned: z.array(z.string().min(1)),
    deadlines: z.array(z.string().min(1)),
    risks: z.array(z.string().min(1)),
    followUps: z.array(z.string().min(1)),
  })
  .strict();

export type CampaignPlaybookOutput = z.infer<typeof campaignPlaybookOutputSchema>;
export type CampaignPlaybookStageOutput = z.infer<typeof playbookStageOutputSchema>;
export type CampaignSummaryOutput = z.infer<typeof campaignSummaryOutputSchema>;
export type TargetSummaryOutput = z.infer<typeof targetSummaryOutputSchema>;
export type DataSourceClassificationOutput = z.infer<typeof dataSourceClassificationOutputSchema>;
export type UpdateExtractionOutput = z.infer<typeof updateExtractionOutputSchema>;

