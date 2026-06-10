import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { archiveCampaign } from "@/lib/services/campaign-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    return ok(await archiveCampaign(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

