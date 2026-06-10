import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { listCampaignDataSources } from "@/lib/services/data-source-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    return ok(await listCampaignDataSources(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

