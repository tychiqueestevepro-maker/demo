import { NextRequest, NextResponse } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { ApiError } from "@/lib/auth";
import { advanceDueTargetSteps } from "@/lib/services/target-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (secret && authHeader !== `Bearer ${secret}`) {
      throw new ApiError(401, "Unauthorized cron request.");
    }

    const advanced = await advanceDueTargetSteps();
    return ok({ advanced: advanced.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST." }, { status: 405 });
}
