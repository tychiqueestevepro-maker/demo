"use server";

import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markFollowUpCompleted(id: string) {
  const { userId } = await getServerUser();

  await prisma.followUp.updateMany({
    where: { id, userId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  revalidatePath("/app/follow-ups");
}

export async function snoozeFollowUp(id: string) {
  const { userId } = await getServerUser();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.followUp.updateMany({
    where: { id, userId },
    data: {
      status: "SNOOZED",
      dueAt: nextWeek,
    },
  });

  revalidatePath("/app/follow-ups");
}
