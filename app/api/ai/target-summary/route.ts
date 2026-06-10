import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { generateTargetSummary } from "@/lib/services/ai-service";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().optional(),
  campaignContext: z.unknown().optional(),
  targetData: z.unknown().optional(),
  notes: z.string().optional(),
  updates: z.array(z.unknown()).optional(),
  dataSources: z.array(z.unknown()).optional(),
  previousMessages: z.array(z.unknown()).optional(),
  currentStatus: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    return ok(await generateTargetSummary(schema.parse(await request.json())));
  } catch (error) {
    return handleApiError(error);
  }
}
