import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { readJson } from "@/lib/request";
import { markMessageSent } from "@/lib/services/target-service";
import { markSentSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    const input = markSentSchema.parse(await readJson(request));
    return ok(await markMessageSent(userId, targetId, input.followUpId));
  } catch (error) {
    return handleApiError(error);
  }
}

