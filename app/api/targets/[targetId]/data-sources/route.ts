import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { listTargetDataSources } from "@/lib/services/data-source-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    return ok(await listTargetDataSources(userId, targetId));
  } catch (error) {
    return handleApiError(error);
  }
}

