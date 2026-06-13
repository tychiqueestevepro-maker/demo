import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await params;

    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    // Retrieve the invoice from Stripe to get the hosted PDF URL
    const invoice = await stripe.invoices.retrieve(id);
    const url = invoice.invoice_pdf || invoice.hosted_invoice_url;

    if (!url) {
      return NextResponse.json({ error: "Invoice PDF URL not found" }, { status: 404 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
