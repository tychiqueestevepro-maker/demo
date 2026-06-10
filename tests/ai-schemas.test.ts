import { describe, expect, it } from "vitest";

import { campaignPlaybookOutputSchema, campaignSummaryOutputSchema } from "@/lib/ai-schemas";

function validPlaybook(stageCount: number) {
  return {
    campaignSummary: "Campaign aims to collect a clear manual response.",
    campaignLogic: {
      reasoning: "The target relationship and urgency require a measured sequence.",
      chosenApproach: "Use a concise ask, a contextual reminder, and stop when no longer useful.",
      whyThisStructureFits: "The structure adapts pressure to the stated campaign risk.",
      pressureLevel: "MEDIUM",
      riskIfNoResponse: "The campaign may stall without a clear owner.",
      humanControlNotes: "Prepare messages for manual copy and user-controlled sending only.",
    },
    recommendedStatuses: ["NOT_CONTACTED", "WAITING", "FOLLOW_UP_DUE", "COMPLETED"],
    stages: Array.from({ length: stageCount }, (_, index) => ({
      order: index + 1,
      name: index === 0 ? "Initial ask" : `Follow-up ${index}`,
      type: index === 0 ? "INITIAL" : index === stageCount - 1 ? "FINAL" : "FOLLOW_UP",
      goalOfStage: "Move the target to the next clear action.",
      delayDays: index === 0 ? 0 : index + 1,
      condition: index === 0 ? "Use after target context is reviewed." : "Use if no reply has been received.",
      messageSubject: "Quick follow-up",
      messageBody: "Hi {{firstName}}, sharing a clear manual follow-up.",
      recommendedChannel: "Email",
      whyThisMessage: "It keeps pressure controlled and gives one clear ask.",
      nextStatus: "WAITING",
    })),
    rules: [{ if: "Target replies", then: "Stop sequence and handle reply", reason: "Human response changes the next action." }],
    escalationLogic: "Escalate only if the configured deadline or business risk requires it.",
    stopCondition: "Stop when the target replies, completes the request, or asks to stop.",
    successCondition: "The requested action is completed or a clear next step is confirmed.",
    risks: ["Missing information can reduce personalization."],
    setupSuggestions: ["Add source context before sending."],
  };
}

describe("campaignPlaybookOutputSchema", () => {
  it.each([2, 3, 5])("accepts a valid playbook with %i stages", (stageCount) => {
    expect(() => campaignPlaybookOutputSchema.parse(validPlaybook(stageCount))).not.toThrow();
  });

  it("rejects missing campaignLogic", () => {
    const playbook = validPlaybook(3);
    delete (playbook as Partial<typeof playbook>).campaignLogic;

    expect(() => campaignPlaybookOutputSchema.parse(playbook)).toThrow();
  });

  it("rejects a stage without condition", () => {
    const playbook = validPlaybook(3);
    delete (playbook.stages[0] as Partial<(typeof playbook.stages)[number]>).condition;

    expect(() => campaignPlaybookOutputSchema.parse(playbook)).toThrow();
  });

  it("rejects invalid pressureLevel", () => {
    const playbook = validPlaybook(3);
    playbook.campaignLogic.pressureLevel = "EXTREME";

    expect(() => campaignPlaybookOutputSchema.parse(playbook)).toThrow();
  });
});

describe("campaignSummaryOutputSchema", () => {
  it("rejects invalid riskLevel", () => {
    expect(() =>
      campaignSummaryOutputSchema.parse({
        campaignSummary: "Summary",
        progress: "Progress",
        mainBlockers: [],
        hotTargets: [],
        followUpsDue: [],
        dataSourcesWorthChecking: [],
        nextPriorities: [],
        riskLevel: "CRITICAL",
      }),
    ).toThrow();
  });
});
