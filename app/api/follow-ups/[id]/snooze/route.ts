import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { snoozeFollowUp } from "@/lib/services/follow-up-service";
import { snoozeSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const input = snoozeSchema.parse(await request.json());
    return ok(await snoozeFollowUp(userId, id, input.dueAt));
  } catch (error) {
    return handleApiError(error);
  }
}

