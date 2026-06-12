import { prisma } from "@/lib/db";

const TRIAL_DAYS = 14;

export type SubscriptionInfo = {
  id: string;
  plan: string;
  status: string;
  isTrialing: boolean;
  isActive: boolean;
  isExpired: boolean;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  daysRemaining: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export async function createTrialSubscription(userId: string): Promise<void> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  await prisma.subscription.create({
    data: {
      userId,
      plan: "solo",
      status: "trialing",
      trialEndsAt,
    },
  });
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo | null> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;

  const now = new Date();
  const isTrialing = sub.status === "trialing" && sub.trialEndsAt != null && sub.trialEndsAt > now;
  const isActive = sub.status === "active" && sub.currentPeriodEnd != null && sub.currentPeriodEnd > now;
  const isExpired = !isTrialing && !isActive;

  let daysRemaining: number | null = null;
  if (isTrialing && sub.trialEndsAt) {
    daysRemaining = Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  } else if (isActive && sub.currentPeriodEnd) {
    daysRemaining = Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return {
    id: sub.id,
    plan: sub.plan,
    status: sub.status,
    isTrialing,
    isActive,
    isExpired,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
    daysRemaining,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
  };
}

export async function isAccessAllowed(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;
  return !sub.isExpired;
}

export async function activateSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  currentPeriodEnd: Date,
): Promise<void> {
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
    },
    create: {
      userId,
      plan: "solo",
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
    },
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });
}

export async function updateSubscriptionPeriod(
  userId: string,
  currentPeriodEnd: Date,
): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: { currentPeriodEnd },
  });
}
