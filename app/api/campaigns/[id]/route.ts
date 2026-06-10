import { NextRequest } from "next/server";

import { handleApiError, noContent, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { deleteCampaign, getCampaign, updateCampaign } from "@/lib/services/campaign-service";
import { campaignPatchSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    return ok(await getCampaign(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const input = campaignPatchSchema.parse(await request.json());
    return ok(await updateCampaign(userId, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    await deleteCampaign(userId, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}

