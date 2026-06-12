import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getInvoiceDownloadUrl } from "@/lib/services/invoice-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const url = await getInvoiceDownloadUrl(userId, id);
    return NextResponse.json({ url });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
