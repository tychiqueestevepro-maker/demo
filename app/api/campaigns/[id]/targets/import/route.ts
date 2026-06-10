import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { importTargetsFromCsv } from "@/lib/services/target-service";
import { targetImportSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await params;
    const input = targetImportSchema.parse(await request.json());
    return ok(await importTargetsFromCsv(userId, id, input.csv), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

