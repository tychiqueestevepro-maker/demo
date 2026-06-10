import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { regenerateMessage } from "@/lib/services/ai-service";

export const runtime = "nodejs";

const schema = z.object({
  currentMessage: z.string().min(1),
  tone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    return ok(await regenerateMessage(schema.parse(await request.json())));
  } catch (error) {
    return handleApiError(error);
  }
}

