import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { generateCampaignSummary } from "@/lib/services/ai-service";

export const runtime = "nodejs";

const schema = z.object({
  goal: z.string().optional(),
  progress: z.string().optional(),
  targets: z.array(z.unknown()).optional(),
  followUps: z.array(z.unknown()).optional(),
  blockers: z.array(z.string()).optional(),
  updates: z.array(z.string()).optional(),
  dataSources: z.array(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    return ok(await generateCampaignSummary(schema.parse(await request.json())));
  } catch (error) {
    return handleApiError(error);
  }
}
