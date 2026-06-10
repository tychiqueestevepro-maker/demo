import {
  CampaignStatus,
  CampaignType,
  DataSourceType,
  FollowUpStatus,
  StageType,
  TargetPriority,
  TargetStatus,
  UpdateType,
} from "@prisma/client";
import { z } from "zod";

export const idSchema = z.string().min(1);
export const optionalDateSchema = z.coerce.date().optional().nullable();

export const campaignCreateSchema = z.object({
  name: z.string().min(2).max(160),
  type: z.enum(CampaignType),
  goal: z.string().min(5).max(1200),
  description: z.string().max(3000).optional().nullable(),
  targetAudience: z.string().max(800).optional().nullable(),
  channel: z.string().max(120).optional().nullable(),
  tone: z.string().max(120).optional().nullable(),
  urgency: z.string().max(120).optional().nullable(),
  status: z.enum(CampaignStatus).optional(),
  priority: z.enum(TargetPriority).optional(),
  deadline: optionalDateSchema,
});

export const campaignPatchSchema = campaignCreateSchema.partial().extend({
  aiSummary: z.string().max(3000).optional().nullable(),
  aiHealth: z.string().max(1000).optional().nullable(),
});

export const generatePlaybookSchema = z.object({
  campaignId: z.string().optional(),
  type: z.enum(CampaignType),
  goal: z.string().min(5),
  context: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  urgency: z.string().optional().nullable(),
  tone: z.string().optional().nullable(),
  channel: z.string().optional().nullable(),
  rules: z
    .object({
      followUpCount: z.number().int().min(1).max(8).optional(),
      delayDays: z.array(z.number().int().min(0).max(60)).optional(),
      stopCondition: z.string().optional(),
      escalationCondition: z.string().optional(),
    })
    .optional(),
});

export const targetCreateSchema = z.object({
  name: z.string().min(1).max(160),
  company: z.string().max(160).optional().nullable(),
  role: z.string().max(160).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(80).optional().nullable(),
  profileUrl: z.string().url().optional().nullable(),
  customChannelUrl: z.string().url().optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
  status: z.enum(TargetStatus).optional(),
  priority: z.enum(TargetPriority).optional(),
  currentStageId: z.string().optional().nullable(),
  nextActionAt: optionalDateSchema,
});

export const targetPatchSchema = targetCreateSchema.partial().extend({
  lastActionAt: optionalDateSchema,
  followUpCount: z.number().int().min(0).optional(),
  aiSummary: z.string().max(3000).optional().nullable(),
  aiRecommendedAction: z.string().max(1200).optional().nullable(),
  aiRisk: z.string().max(500).optional().nullable(),
});

export const targetImportSchema = z.object({
  csv: z.string().min(1),
});

export const followUpPatchSchema = z.object({
  status: z.enum(FollowUpStatus).optional(),
  dueAt: z.coerce.date().optional(),
  sentAt: optionalDateSchema,
  copiedAt: optionalDateSchema,
  completedAt: optionalDateSchema,
  messageSubject: z.string().max(300).optional().nullable(),
  messageBody: z.string().min(1).max(5000).optional(),
  reason: z.string().max(1000).optional().nullable(),
  priority: z.enum(TargetPriority).optional(),
});

export const snoozeSchema = z.object({
  dueAt: z.coerce.date(),
});

export const markSentSchema = z.object({
  followUpId: z.string().optional(),
});

export const copyMessageSchema = z.object({
  stageId: z.string().optional(),
  followUpId: z.string().optional(),
});

export const dataSourceCreateSchema = z.object({
  campaignId: z.string().optional().nullable(),
  targetId: z.string().optional().nullable(),
  title: z.string().min(1).max(240),
  type: z.enum(DataSourceType),
  url: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  importance: z.enum(TargetPriority).optional(),
  owner: z.string().max(160).optional().nullable(),
  lastCheckedAt: optionalDateSchema,
});

export const dataSourcePatchSchema = dataSourceCreateSchema.partial();

export const updateCreateSchema = z.object({
  targetId: z.string().optional().nullable(),
  type: z.enum(UpdateType),
  content: z.string().min(1).max(6000),
  source: z.string().max(160).optional().nullable(),
  aiExtractedSummary: z.string().max(2000).optional().nullable(),
});

export const templateCreateSchema = z.object({
  campaignType: z.enum(CampaignType),
  stageType: z.enum(StageType),
  name: z.string().min(1).max(180),
  subject: z.string().max(300).optional().nullable(),
  body: z.string().min(1).max(5000),
  tone: z.string().max(120).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignPatchInput = z.infer<typeof campaignPatchSchema>;
export type GeneratePlaybookInput = z.infer<typeof generatePlaybookSchema>;
export type TargetCreateInput = z.infer<typeof targetCreateSchema>;
export type TargetPatchInput = z.infer<typeof targetPatchSchema>;
export type FollowUpPatchInput = z.infer<typeof followUpPatchSchema>;
export type DataSourceCreateInput = z.infer<typeof dataSourceCreateSchema>;
export type UpdateCreateInput = z.infer<typeof updateCreateSchema>;
