import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { classifyDataSource } from "@/lib/services/ai-service";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1),
  url: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  campaignContext: z.unknown().optional(),
  targetContext: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    return ok(await classifyDataSource(schema.parse(await request.json())));
  } catch (error) {
    return handleApiError(error);
  }
}

