import { addDays, subDays } from "date-fns";
import {
  ActivityType,
  CampaignStatus,
  CampaignType,
  DataSourceType,
  FollowUpStatus,
  PrismaClient,
  StageType,
  TargetPriority,
  TargetStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const seedCampaigns = [
  {
    name: "Prospecting SaaS agencies",
    type: CampaignType.PROSPECTING,
    goal: "Book qualified calls with agency founders who need cleaner client follow-up operations.",
    description: "Manual outbound campaign with source-backed personalization.",
    targetAudience: "SaaS agency founders and operations leads",
    channel: "Email + LinkedIn",
    tone: "Concise and helpful",
    urgency: "Medium",
    status: CampaignStatus.ACTIVE,
  },
  {
    name: "Recruiting Account Executive",
    type: CampaignType.RECRUITING,
    goal: "Move high-fit Account Executive candidates to first screen.",
    description: "Candidate outreach with hiring-manager context.",
    targetAudience: "B2B SaaS Account Executives",
    channel: "Email",
    tone: "Warm and direct",
    urgency: "High",
    status: CampaignStatus.ACTIVE,
  },
  {
    name: "HR contract signature",
    type: CampaignType.HR_REQUEST,
    goal: "Collect signed contracts from internal employees before the deadline.",
    description: "Internal reminders with optional manager escalation.",
    targetAudience: "Employees with pending contracts",
    channel: "Email + Slack link",
    tone: "Polite and clear",
    urgency: "High",
    status: CampaignStatus.WAITING,
  },
  {
    name: "Client documents June",
    type: CampaignType.CLIENT_DOCUMENTS,
    goal: "Collect onboarding documents from client stakeholders.",
    description: "Document collection campaign for finance and security assets.",
    targetAudience: "Client finance, legal, and security contacts",
    channel: "Email",
    tone: "Structured and professional",
    urgency: "Medium",
    status: CampaignStatus.BLOCKED,
  },
  {
    name: "Invoice follow-up",
    type: CampaignType.INVOICE_FOLLOW_UP,
    goal: "Resolve unpaid invoices with polite reminders and clear owner routing.",
    description: "Finance follow-up campaign with dispute handling.",
    targetAudience: "Client AP contacts and finance owners",
    channel: "Email",
    tone: "Firm but respectful",
    urgency: "High",
    status: CampaignStatus.ACTIVE,
  },
];

function stagesFor(type: CampaignType) {
  if (type === CampaignType.HR_REQUEST) {
    return [
      ["Initial request", StageType.INITIAL, 0, "Please sign the attached contract before {{deadline}}."],
      ["Reminder", StageType.FOLLOW_UP, 2, "Quick reminder that your signature is still needed."],
      ["Urgent reminder", StageType.FINAL, 1, "This is now urgent for payroll and onboarding timing."],
      ["Manager escalation", StageType.ESCALATION, 1, "Copying the manager context if the deadline is missed."],
    ] as const;
  }

  if (type === CampaignType.INVOICE_FOLLOW_UP) {
    return [
      ["Polite reminder", StageType.INITIAL, 0, "Checking on invoice {{invoiceNumber}} due {{dueDate}}."],
      ["Due date reminder", StageType.FOLLOW_UP, 3, "Following up as the due date has passed."],
      ["Firm reminder", StageType.FOLLOW_UP, 5, "Can you confirm payment status or the right AP owner?"],
      ["Final notice", StageType.FINAL, 7, "Closing the loop unless there is a dispute or payment confirmation."],
    ] as const;
  }

  if (type === CampaignType.CLIENT_DOCUMENTS) {
    return [
      ["Initial request", StageType.INITIAL, 0, "Sharing the required document list for onboarding."],
      ["Missing items reminder", StageType.FOLLOW_UP, 2, "We are still missing {{missingItems}}."],
      ["Deadline reminder", StageType.FINAL, 4, "The deadline is approaching and these items are blocking onboarding."],
      ["Blocking notice", StageType.ESCALATION, 1, "Escalating because required documents remain missing."],
    ] as const;
  }

  return [
    ["Initial message", StageType.INITIAL, 0, "Hi {{firstName}}, quick note about {{goal}}."],
    ["Follow-up 1", StageType.FOLLOW_UP, 3, "Quick nudge in case this is relevant."],
    ["Follow-up 2", StageType.FOLLOW_UP, 5, "Sharing one more practical reason this may help."],
    ["Final break-up", StageType.FINAL, 7, "I will close the loop for now unless useful later."],
  ] as const;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "maya@example.com" },
    update: {},
    create: {
      email: "maya@example.com",
      name: "Maya Chen",
      avatarUrl: "https://example.com/avatar/maya.png",
      subscription: {
        create: {
          plan: "free",
          status: "trialing",
          currentPeriodEnd: addDays(new Date(), 14),
        },
      },
    },
  });

  for (const [campaignIndex, campaignInput] of seedCampaigns.entries()) {
    const campaign = await prisma.campaign.create({
      data: {
        ...campaignInput,
        userId: user.id,
        priority: campaignInput.urgency === "High" ? TargetPriority.HIGH : TargetPriority.MEDIUM,
        deadline: addDays(new Date(), 10 + campaignIndex * 3),
        aiSummary: "Seeded AI summary placeholder. Future provider calls will refresh this from campaign updates.",
        aiHealth: campaignInput.status === CampaignStatus.BLOCKED ? "Needs source or owner cleanup." : "Healthy.",
        launchedAt: campaignInput.status === CampaignStatus.ACTIVE ? subDays(new Date(), 2) : null,
      },
    });

    const playbook = await prisma.campaignPlaybook.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        name: `${campaign.name} playbook`,
        description: "Generated seed playbook for manual execution.",
        generatedByAi: true,
      },
    });

    const createdStages = [];
    for (const [stageIndex, [name, type, delayDays, body]] of stagesFor(campaign.type).entries()) {
      createdStages.push(
        await prisma.playbookStage.create({
          data: {
            playbookId: playbook.id,
            campaignId: campaign.id,
            userId: user.id,
            order: stageIndex + 1,
            name,
            type,
            delayDays,
            condition: stageIndex === 0 ? "Send after target context is reviewed." : "Only if there is no reply or completion.",
            messageSubject: `${campaign.name}: ${name}`,
            messageBody: body,
            tone: campaign.tone,
            isFinal: type === StageType.FINAL,
            requiresEscalation: type === StageType.ESCALATION,
          },
        }),
      );
    }

    for (let targetIndex = 1; targetIndex <= 3; targetIndex += 1) {
      const target = await prisma.campaignTarget.create({
        data: {
          campaignId: campaign.id,
          userId: user.id,
          name: `${["Amelia Brooks", "Jon Bell", "Priya Shah"][targetIndex - 1]} ${campaignIndex + 1}`,
          company: ["Ferro Labs", "Ledgerly", "Northwind"][targetIndex - 1],
          role: ["VP Finance", "CFO", "Account Executive"][targetIndex - 1],
          email: `target${campaignIndex + 1}${targetIndex}@example.com`,
          profileUrl: `https://example.com/profile/${campaignIndex + 1}-${targetIndex}`,
          notes: "Seed target created from user-provided mock data.",
          status: targetIndex === 1 ? TargetStatus.FOLLOW_UP_DUE : targetIndex === 2 ? TargetStatus.REPLIED : TargetStatus.WAITING,
          priority: targetIndex === 1 ? TargetPriority.HIGH : TargetPriority.MEDIUM,
          currentStageId: createdStages[Math.min(targetIndex, createdStages.length - 1)]?.id,
          lastActionAt: subDays(new Date(), targetIndex),
          nextActionAt: addDays(new Date(), targetIndex - 1),
          followUpCount: targetIndex,
          aiSummary: "Target summary placeholder generated from notes and source links.",
          aiRecommendedAction: "Copy the next message, send manually, then mark the action.",
          aiRisk: targetIndex === 1 ? "May become overdue without follow-up." : "Low",
        },
      });

      await prisma.followUp.create({
        data: {
          campaignId: campaign.id,
          targetId: target.id,
          userId: user.id,
          stageId: target.currentStageId,
          status: targetIndex === 1 ? FollowUpStatus.DUE : FollowUpStatus.PENDING,
          dueAt: addDays(new Date(), targetIndex - 1),
          messageSubject: `${campaign.name}: next step`,
          messageBody: "Prepared message only. The MVP never sends automatically.",
          reason: "Seeded next action from playbook timing.",
          priority: target.priority,
        },
      });

      await prisma.dataSource.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          targetId: target.id,
          title: `${target.name} source link`,
          type: targetIndex === 1 ? DataSourceType.LINKEDIN_PROFILE : DataSourceType.CUSTOM_LINK,
          url: `https://example.com/source/${campaignIndex + 1}-${targetIndex}`,
          description: "User-provided link. No scraping or external sync is performed.",
          importance: target.priority,
          owner: user.name,
          lastCheckedAt: new Date(),
        },
      });
    }

    await prisma.update.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        type: "NOTE",
        content: "Campaign seeded for backend MVP testing.",
        source: "seed",
        aiExtractedSummary: "Seed note available for future summary refresh.",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        type: ActivityType.CAMPAIGN_CREATED,
        message: `${campaign.name} was created by the seed script.`,
        metadata: { seed: true },
      },
    });
  }

  await prisma.template.createMany({
    data: [
      {
        userId: user.id,
        campaignType: CampaignType.PROSPECTING,
        stageType: StageType.INITIAL,
        name: "Prospecting opener",
        subject: "Quick idea for {{company}}",
        body: "Hi {{firstName}}, noticed {{company}} is working on {{context}}.",
        tone: "Concise",
        isDefault: true,
      },
      {
        userId: user.id,
        campaignType: CampaignType.RECRUITING,
        stageType: StageType.INITIAL,
        name: "Recruiting first touch",
        subject: "Role that may fit your background",
        body: "Your background stood out for our {{roleName}} opening.",
        tone: "Warm",
        isDefault: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

