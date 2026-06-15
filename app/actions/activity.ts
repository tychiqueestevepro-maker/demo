"use server";

import { revalidatePath } from "next/cache";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";

export async function addConversationMessageAction(campaignId: string, targetId: string, text: string, speaker: "you" | "prospect", time: string) {
  const { userId } = await getServerUser();

  const type = speaker === "you" ? "UPDATE_ADDED" : "TARGET_REPLIED";

  await prisma.activityLog.create({
    data: {
      userId,
      campaignId,
      targetId,
      type,
      message: text,
      metadata: { speaker, time },
    },
  });

  revalidatePath(`/app/campaigns/${campaignId}/targets/${targetId}`);
}
