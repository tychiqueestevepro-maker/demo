import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { addTargetUpdate, listTargetUpdates } from "@/lib/services/update-service";
import { updateCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    return ok(await listTargetUpdates(userId, targetId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    const input = updateCreateSchema.omit({ targetId: true }).parse(await request.json());
    return ok(await addTargetUpdate(userId, targetId, input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

