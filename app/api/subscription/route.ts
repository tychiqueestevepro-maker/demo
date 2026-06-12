import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getSubscription, createTrialSubscription } from "@/lib/services/subscription-service";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);

    let subscription = await getSubscription(userId);

    // Auto-create trial if no subscription exists
    if (!subscription) {
      await createTrialSubscription(userId);
      subscription = await getSubscription(userId);
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
