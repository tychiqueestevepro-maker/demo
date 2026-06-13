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

    // 1. Fetch user's subscription
    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub || !sub.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
    }

    if (sub.hasUsedDiscount) {
      return NextResponse.json({ error: "Discount already used." }, { status: 400 });
    }

    // 2. Ensure "30_OFF" coupon exists on Stripe, or create it
    const couponId = "30_OFF";
    try {
      await stripe.coupons.retrieve(couponId);
    } catch {
      // Create it dynamically if it does not exist
      await stripe.coupons.create({
        id: couponId,
        percent_off: 30,
        duration: "forever",
      });
    }

    // 3. Apply coupon to the Stripe subscription
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      coupon: couponId,
    } as any);

    // 4. Record that the user has consumed their discount
    await prisma.subscription.update({
      where: { userId },
      data: {
        hasUsedDiscount: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
