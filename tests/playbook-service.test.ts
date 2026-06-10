import { CampaignType, StageType } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CampaignPlaybookOutput } from "@/lib/ai-schemas";

const campaignFindUnique = vi.fn();
const campaignPlaybookCreate = vi.fn();
const followUpCreateMany = vi.fn();
const createActivityLog = vi.fn();
const generatePlaybook = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    campaign: { findUnique: campaignFindUnique },
    campaignPlaybook: { create: campaignPlaybookCreate },
    followUp: { createMany: followUpCreateMany },
  },
}));

vi.mock("@/lib/services/activity-service", () => ({
  createActivityLog,
}));

vi.mock("@/lib/services/ai-service", () => ({
  generatePlaybook,
}));

const aiOutput: CampaignPlaybookOutput = {
  campaignSummary: "Manual campaign to obtain the requested action.",
  campaignLogic: {
    reasoning: "The target context supports a tailored, non-automatic sequence.",
    chosenApproach: "Start with a clear ask, follow with context, then stop.",
    whyThisStructureFits: "It adapts pressure to the stated urgency.",
    pressureLevel: "MEDIUM",
    riskIfNoResponse: "The work may stall without a reply.",
    humanControlNotes: "Messages are prepared for manual copy and user-controlled sending only.",
  },
  recommendedStatuses: ["NOT_CONTACTED", "WAITING", "COMPLETED"],
  stages: [
    {
      order: 1,
      name: "Initial ask",
      type: StageType.INITIAL,
      goalOfStage: "Ask for the requested action.",
      delayDays: 0,
      condition: "Use once context is reviewed.",
      messageSubject: "Quick request",
      messageBody: "Hi {{firstName}}, can you confirm the next step?",
      recommendedChannel: "Email",
      whyThisMessage: "It makes one clear manual ask.",
      nextStatus: "WAITING",
    },
    {
      order: 2,
      name: "Close the loop",
      type: StageType.FINAL,
      goalOfStage: "Close respectfully if there is no reply.",
      delayDays: 3,
      condition: "Use if no reply after three days.",
      messageSubject: "Closing the loop",
      messageBody: "I will close the loop for now unless useful.",
      recommendedChannel: "Email",
      whyThisMessage: "It stops pressure while keeping the door open.",
      nextStatus: "STOPPED",
    },
  ],
  rules: [{ if: "Target replies", then: "Stop sequence", reason: "Human reply changes the next action." }],
  escalationLogic: "No escalation unless the user explicitly configures it.",
  stopCondition: "Stop after final message, reply, completion, or stop request.",
  successCondition: "Target confirms the requested next step.",
  risks: ["Missing information can reduce precision."],
  setupSuggestions: ["Add source context."],
};

describe("generateCampaignPlaybook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generatePlaybook.mockResolvedValue(aiOutput);
  });

  it("persists playbook JSON and stage metadata", async () => {
    campaignFindUnique.mockResolvedValue({
      id: "campaign-1",
      userId: "user-1",
      name: "Test campaign",
      type: CampaignType.PROSPECTING,
      goal: "Get a reply",
      description: "Context",
      targetAudience: "Founders",
      urgency: "Medium",
      tone: "Concise",
      channel: "Email",
      targets: [],
      dataSources: [],
    });
    campaignPlaybookCreate.mockImplementation(async ({ data }) => ({ id: "playbook-1", ...data }));

    const { generateCampaignPlaybook } = await import("@/lib/services/playbook-service");

    await generateCampaignPlaybook("user-1", {
      campaignId: "campaign-1",
      type: CampaignType.PROSPECTING,
      goal: "Get a reply",
    });

    expect(campaignPlaybookCreate).toHaveBeenCalledTimes(1);
    const data = campaignPlaybookCreate.mock.calls[0][0].data;
    expect(data.campaignLogic).toEqual(aiOutput.campaignLogic);
    expect(data.rules).toEqual(aiOutput.rules);
    expect(data.rawAiOutput).toEqual(aiOutput);
    expect(data.stages.create[0]).toMatchObject({
      goalOfStage: aiOutput.stages[0].goalOfStage,
      recommendedChannel: aiOutput.stages[0].recommendedChannel,
      whyThisMessage: aiOutput.stages[0].whyThisMessage,
      nextStatus: aiOutput.stages[0].nextStatus,
    });
    expect(createActivityLog).toHaveBeenCalledWith(expect.objectContaining({ type: "PLAYBOOK_GENERATED" }));
  });

  it("does not create follow-ups during preview generation", async () => {
    const { generateCampaignPlaybook } = await import("@/lib/services/playbook-service");

    const result = await generateCampaignPlaybook("user-1", {
      type: CampaignType.PROSPECTING,
      goal: "Get a reply",
    });

    expect(result).toEqual(aiOutput);
    expect(aiOutput.campaignLogic.humanControlNotes.toLowerCase()).toContain("manual");
    expect(campaignPlaybookCreate).not.toHaveBeenCalled();
    expect(followUpCreateMany).not.toHaveBeenCalled();
  });
});

describe("OpenAI provider", () => {
  it("throws an explicit config error when OPENAI_API_KEY is absent", async () => {
    const previousKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const { openAiProvider } = await import("@/lib/services/ai-provider");
    const { campaignSummaryOutputSchema } = await import("@/lib/ai-schemas");

    await expect(
      openAiProvider.generateStructured({
        schema: campaignSummaryOutputSchema,
        schemaName: "campaign_summary",
        systemPrompt: "Return a summary.",
        userPrompt: "{}",
      }),
    ).rejects.toThrow("OPENAI_API_KEY is required");

    if (previousKey) {
      process.env.OPENAI_API_KEY = previousKey;
    }
  });
});

