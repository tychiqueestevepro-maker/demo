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

    if (!sub || !sub.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "https://www.verytis.com";

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/app/settings?tab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
