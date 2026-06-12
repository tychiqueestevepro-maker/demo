import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { listUserInvoices } from "@/lib/services/invoice-service";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const invoices = await listUserInvoices(userId);
    return NextResponse.json({ invoices });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
