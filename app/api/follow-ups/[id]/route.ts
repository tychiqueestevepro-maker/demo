import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { updateFollowUp } from "@/lib/services/follow-up-service";
import { followUpPatchSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const input = followUpPatchSchema.parse(await request.json());
    return ok(await updateFollowUp(userId, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

