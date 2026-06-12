"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function pauseCampaignAction(campaignId: string) {
  const { userId } = await getServerUser();

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, userId },
    select: { id: true, status: true },
  });

  if (!campaign) throw new Error("Campaign not found");

  // Toggle: ACTIVE → PAUSED, anything else → ACTIVE
  const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: newStatus },
  });

  revalidatePath(`/app/campaigns/${campaignId}`);
  revalidatePath("/app/campaigns");

  return { status: newStatus };
}

export async function deleteCampaignAction(campaignId: string) {
  const { userId } = await getServerUser();

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, userId },
    select: { id: true },
  });

  if (!campaign) throw new Error("Campaign not found");

  await prisma.campaign.delete({ where: { id: campaignId } });

  revalidatePath("/app/campaigns");
  redirect("/app/campaigns");
}
