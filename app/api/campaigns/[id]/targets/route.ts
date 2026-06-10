import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { addTargets, listTargets } from "@/lib/services/target-service";
import { targetCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    return ok(await listTargets(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const json = await request.json();
    const input = Array.isArray(json) ? json.map((item) => targetCreateSchema.parse(item)) : targetCreateSchema.parse(json);
    return ok(await addTargets(userId, id, input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

