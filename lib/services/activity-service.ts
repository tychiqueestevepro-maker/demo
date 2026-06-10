import { ActivityType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function createActivityLog(input: {
  userId: string;
  campaignId: string;
  targetId?: string | null;
  type: ActivityType;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.activityLog.create({
    data: {
      userId: input.userId,
      campaignId: input.campaignId,
      targetId: input.targetId,
      type: input.type,
      message: input.message,
      metadata: input.metadata,
    },
  });
}

