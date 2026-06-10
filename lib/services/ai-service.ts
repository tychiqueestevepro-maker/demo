import { z } from "zod";

import {
  campaignPlaybookOutputSchema,
  campaignSummaryOutputSchema,
  dataSourceClassificationOutputSchema,
  targetSummaryOutputSchema,
  updateExtractionOutputSchema,
  type CampaignPlaybookOutput,
} from "@/lib/ai-schemas";
import { type AiProvider, openAiProvider } from "@/lib/services/ai-provider";
import type { GeneratePlaybookInput } from "@/lib/validators";

let aiProvider: AiProvider = openAiProvider;

export function setAiProviderForTests(provider: AiProvider) {
  if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
    throw new Error("setAiProviderForTests can only be used in tests.");
  }

  aiProvider = provider;
}

export function resetAiProviderForTests() {
  aiProvider = openAiProvider;
}

const campaignAssistantSystemPrompt = `
You are the structured campaign assistant inside FollowPilot.
You are not a general chatbot. You transform campaign goals into operational playbooks, summaries, classifications, and action extraction.
Always adapt to the real campaign context. Never apply a fixed sequence mechanically.
Never claim that a message was sent. The product only prepares copy, next actions, recommended dates, and statuses. The user sends manually.
Never scrape, suggest scraping, or imply external integrations. Use only user-provided text and links.
Do not invent facts. If information is missing, write "Missing information".
Keep outputs precise, simple, actionable, and suitable for UI rendering.
`;

export async function generatePlaybook(input: GeneratePlaybookInput) {
  return aiProvider.generateStructured({
    schema: campaignPlaybookOutputSchema,
    schemaName: "campaign_playbook",
    systemPrompt: `${campaignAssistantSystemPrompt}
Generate a dynamic campaign playbook. Before choosing stages, reason about:
1. desired outcome;
2. risk if nobody responds;
3. acceptable pressure;
4. reasonable number of follow-ups;
5. stop timing;
6. escalation timing;
7. useful message per stage;
8. missing data that would improve precision.
The structure must be justified and must vary by campaign type, urgency, deadline, relationship, data availability, and user rules.
Every stage must have a clear condition, channel, message subject, message body, reason, next status, and send timing through delayDays.
`,
    userPrompt: JSON.stringify(input, null, 2),
  });
}

export async function generateCampaignSummary(input: {
  goal?: string;
  progress?: string;
  targets?: unknown[];
  followUps?: unknown[];
  blockers?: string[];
  updates?: string[];
  dataSources?: unknown[];
}) {
  return aiProvider.generateStructured({
    schema: campaignSummaryOutputSchema,
    schemaName: "campaign_summary",
    systemPrompt: `${campaignAssistantSystemPrompt}
Summarize the campaign for an operations dashboard. Include objective, progress, important targets, due follow-ups, blockers, risks, next priorities, and sources worth checking.
If context is absent, use "Missing information" rather than guessing.
`,
    userPrompt: JSON.stringify(input, null, 2),
  });
}

export async function generateTargetSummary(input: {
  campaignContext?: unknown;
  targetData?: unknown;
  notes?: string;
  updates?: unknown[];
  dataSources?: unknown[];
  previousMessages?: unknown[];
  currentStatus?: string;
  name?: string;
}) {
  return aiProvider.generateStructured({
    schema: targetSummaryOutputSchema,
    schemaName: "target_summary",
    systemPrompt: `${campaignAssistantSystemPrompt}
Generate a target-specific summary. Do not invent facts. Always propose a next action unless no action is needed, and explain why.
If the target is blocked by missing source/context, say so clearly.
The recommended message must be prepared for manual copy/send only.
`,
    userPrompt: JSON.stringify(input, null, 2),
  });
}

export async function classifyDataSource(input: {
  title: string;
  url?: string | null;
  note?: string | null;
  campaignContext?: unknown;
  targetContext?: unknown;
}) {
  return aiProvider.generateStructured({
    schema: dataSourceClassificationOutputSchema,
    schemaName: "data_source_classification",
    systemPrompt: `${campaignAssistantSystemPrompt}
Classify a user-provided data source. Decide whether it belongs to the whole campaign or a specific target, estimate importance, and explain why it matters.
Never fetch, inspect, scrape, or claim to verify the URL.
`,
    userPrompt: JSON.stringify(input, null, 2),
  });
}

export async function extractActionsFromUpdate(input: { content: string; campaignContext?: unknown; targetContext?: unknown }) {
  return aiProvider.generateStructured({
    schema: updateExtractionOutputSchema,
    schemaName: "update_extraction",
    systemPrompt: `${campaignAssistantSystemPrompt}
Extract only what is present or strongly deducible from the update. Mark ambiguous actions as "needs clarification".
Capture deadlines when mentioned and create follow-up suggestions only when someone needs to be contacted or reminded.
`,
    userPrompt: JSON.stringify(input, null, 2),
  });
}

const regeneratedMessageSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();

export async function regenerateMessage(input: { currentMessage: string; tone?: string }) {
  return aiProvider.generateStructured({
    schema: regeneratedMessageSchema,
    schemaName: "regenerated_message",
    systemPrompt: `${campaignAssistantSystemPrompt}
Rewrite the prepared campaign message in the requested tone. Keep it natural, concise, and action-oriented.
Do not claim the message has been sent.
`,
    userPrompt: JSON.stringify(input, null, 2),
  });
}

export function ensureManualControlLanguage(output: CampaignPlaybookOutput) {
  const text = [
    output.campaignLogic.humanControlNotes,
    output.stopCondition,
    output.successCondition,
    output.stages.map((stage) => `${stage.messageSubject} ${stage.messageBody} ${stage.whyThisMessage}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return text.includes("manual") || text.includes("copy") || text.includes("user sends");
}

