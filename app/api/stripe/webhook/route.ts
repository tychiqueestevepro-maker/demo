import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { activateSubscription, cancelSubscription, updateSubscriptionPeriod } from "@/lib/services/subscription-service";
import { prisma } from "@/lib/db";
import { generateInvoicePdf, uploadInvoiceToSupabase } from "@/lib/services/invoice-service";

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

        // Find user by subscription ID, customer ID, or email
        let subRecord = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          include: { user: { select: { id: true, email: true, name: true } } },
        });

        if (!subRecord) {
          // Fallback 1: Try by customer ID
          subRecord = await prisma.subscription.findFirst({
            where: { stripeCustomerId: invoice.customer as string },
            include: { user: { select: { id: true, email: true, name: true } } },
          });
        }

        if (!subRecord) {
          // Fallback 2: Try by email
          const email = invoice.customer_email || invoice.customer_details?.email;
          if (email) {
            subRecord = await prisma.subscription.findFirst({
              where: { user: { email } },
              include: { user: { select: { id: true, email: true, name: true } } },
            });
          }
        }

        if (!subRecord) break;

        // If the customer/subscription IDs are missing in our DB, set them now
        if (!subRecord.stripeCustomerId || !subRecord.stripeSubscriptionId) {
          await prisma.subscription.update({
            where: { userId: subRecord.userId },
            data: {
              status: "active",
              stripeCustomerId: invoice.customer as string,
              stripeSubscriptionId: subscriptionId,
            },
          });
        }

        // Update period end
        if (invoice.lines?.data?.[0]?.period?.end) {
          const periodEnd = new Date(invoice.lines.data[0].period.end * 1000);
          await updateSubscriptionPeriod(subRecord.userId, periodEnd);
        }

        // Generate and upload PDF invoice
        try {
          const amount = (invoice.amount_paid ?? 0) / 100;
          const currency = (invoice.currency ?? "usd").toUpperCase();
          const periodStart = invoice.lines?.data?.[0]?.period?.start
            ? new Date(invoice.lines.data[0].period.start * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          const periodEndStr = invoice.lines?.data?.[0]?.period?.end
            ? new Date(invoice.lines.data[0].period.end * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

          const invoicePdf = generateInvoicePdf({
            invoiceNumber: invoice.number ?? invoice.id,
            date: new Date((invoice.status_transitions?.paid_at ?? Date.now() / 1000) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            periodStart,
            periodEnd: periodEndStr,
            customerName: subRecord.user.name ?? "Customer",
            customerEmail: subRecord.user.email,
            amount,
            currency,
          });

          await uploadInvoiceToSupabase(subRecord.userId, invoicePdf, invoice.id);
        } catch (pdfErr) {
          console.error("Failed to generate/upload invoice PDF:", pdfErr);
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
