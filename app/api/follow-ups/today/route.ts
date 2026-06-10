import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { listTodayFollowUps } from "@/lib/services/follow-up-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    return ok(await listTodayFollowUps(userId));
  } catch (error) {
    return handleApiError(error);
  }
}

