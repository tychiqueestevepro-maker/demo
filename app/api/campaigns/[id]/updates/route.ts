import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { addUpdateAndRefreshSummary, listCampaignUpdates } from "@/lib/services/update-service";
import { updateCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    return ok(await listCampaignUpdates(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const input = updateCreateSchema.parse(await request.json());
    return ok(await addUpdateAndRefreshSummary(userId, id, input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

