import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { activateSubscription, cancelSubscription, updateSubscriptionPeriod } from "@/lib/services/subscription-service";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date((sub as any).current_period_end * 1000);

        await activateSubscription(
          userId,
          session.customer as string,
          subscriptionId,
          periodEnd,
        );
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;

        // Find user by subscription
        const subRecord = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          include: { user: { select: { id: true, email: true, name: true } } },
        });

        if (!subRecord) break;

        // Update period end
        if (invoice.lines?.data?.[0]?.period?.end) {
          const periodEnd = new Date(invoice.lines.data[0].period.end * 1000);
          await updateSubscriptionPeriod(subRecord.userId, periodEnd);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const periodEnd = new Date(sub.current_period_end * 1000);
        await updateSubscriptionPeriod(userId, periodEnd);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await cancelSubscription(userId);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
