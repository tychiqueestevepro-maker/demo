import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { markFollowUpSent } from "@/lib/services/follow-up-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    return ok(await markFollowUpSent(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

