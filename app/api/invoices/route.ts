import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);

    if (!stripe) {
      return NextResponse.json({ invoices: [] });
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub || !sub.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    // List invoices from Stripe for the specific customer
    const stripeInvoices = await stripe.invoices.list({
      customer: sub.stripeCustomerId,
      limit: 50,
    });

    // Format the invoices to match the component's expected format
    const invoices = stripeInvoices.data.map((inv) => ({
      id: inv.id,
      name: inv.number || `Invoice ${inv.id}`,
      createdAt: new Date(inv.created * 1000).toISOString(),
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
