import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { stopTarget } from "@/lib/services/target-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    return ok(await stopTarget(userId, targetId));
  } catch (error) {
    return handleApiError(error);
  }
}

