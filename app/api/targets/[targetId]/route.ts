import { NextRequest } from "next/server";

import { handleApiError, noContent, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { deleteTarget, getTarget, updateTarget } from "@/lib/services/target-service";
import { targetPatchSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    return ok(await getTarget(userId, targetId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    const input = targetPatchSchema.parse(await request.json());
    return ok(await updateTarget(userId, targetId, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ targetId: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { targetId } = await params;
    await deleteTarget(userId, targetId);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}

