"use server";

import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCampaignAction(data: {
  name: string;
  type: string;
  goal: string;
  audience: string;
  cadence: string;
  tone: string;
  targets: Array<{
    name: string;
    company: string;
    role: string;
    email: string;
    note?: string;
  }>;
  playbookStages: Array<{
    title: string;
    description: string;
    prompt: string;
    dayOffset: number;
    channel: string;
  }>;
}) {
  const { userId } = await getServerUser();

  const campaign = await prisma.campaign.create({
    data: {
      userId,
      name: data.name,
      type: data.type === "Prospecting" ? "PROSPECTING" : data.type === "Recruiting" ? "RECRUITING" : "CUSTOM",
      status: "DRAFT",
      goal: data.goal,
      targetAudience: data.audience,
      tone: data.tone,
      channel: "Gmail",
      targets: {
        create: data.targets.map(t => ({
          user: { connect: { id: userId } },
          name: t.name,
          company: t.company,
          role: t.role,
          email: t.email,
          status: "NOT_CONTACTED",
          priority: "MEDIUM",
          notes: t.note,
        }))
      },
    },
  });

  // Create the playbook and stages separately so we have the campaign id
  if (data.playbookStages.length > 0) {
    const playbook = await prisma.campaignPlaybook.create({
      data: {
        userId,
        campaignId: campaign.id,
        name: `${data.name} Playbook`,
        description: `Tone: ${data.tone} | Cadence: ${data.cadence}`,
      },
    });

    await prisma.playbookStage.createMany({
      data: data.playbookStages.map((s, i) => ({
        userId,
        campaignId: campaign.id,
        playbookId: playbook.id,
        order: i,
        name: s.title,
        type: i === 0 ? "INITIAL" : i === data.playbookStages.length - 1 ? "FINAL" : "FOLLOW_UP",
        messageBody: s.prompt || s.description,
        delayDays: s.dayOffset,
        recommendedChannel: s.channel,
        goalOfStage: s.description,
      })),
    });
  }

  revalidatePath("/app/campaigns");
  return campaign;
}
