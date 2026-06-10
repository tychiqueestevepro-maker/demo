import { NextRequest } from "next/server";

import { handleApiError, noContent, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { deleteDataSource, updateDataSource } from "@/lib/services/data-source-service";
import { dataSourcePatchSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const input = dataSourcePatchSchema.parse(await request.json());
    return ok(await updateDataSource(userId, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    await deleteDataSource(userId, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}

