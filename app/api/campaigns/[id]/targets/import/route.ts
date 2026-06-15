import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

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
    const targets = await importTargetsFromCsv(userId, id, input.csv);
    revalidatePath(`/app/campaigns/${id}`);
    revalidatePath("/app/campaigns");
    return ok(targets, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
