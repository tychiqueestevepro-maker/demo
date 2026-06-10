import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { createCampaign, listCampaigns } from "@/lib/services/campaign-service";
import { campaignCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    return ok(await listCampaigns(userId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const input = campaignCreateSchema.parse(await request.json());
    return ok(await createCampaign(userId, input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

