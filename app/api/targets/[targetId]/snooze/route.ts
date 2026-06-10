import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { snoozeTarget } from "@/lib/services/target-service";
import { snoozeSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    const input = snoozeSchema.parse(await request.json());
    return ok(await snoozeTarget(userId, targetId, input.dueAt));
  } catch (error) {
    return handleApiError(error);
  }
}

