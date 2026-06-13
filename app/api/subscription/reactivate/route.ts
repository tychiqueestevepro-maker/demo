import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);

    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    const sub = await prisma.subscription.findUnique({ where: { userId } });

    if (!sub || !sub.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
    }

    // Cancel the cancellation (reactivate)
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Remove the cancelledAt date in our DB
    await prisma.subscription.update({
      where: { userId },
      data: { cancelledAt: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
