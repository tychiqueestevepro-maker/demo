import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { generatePlaybook } from "@/lib/services/ai-service";
import { generatePlaybookSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    return ok(await generatePlaybook(generatePlaybookSchema.parse(await request.json())));
  } catch (error) {
    return handleApiError(error);
  }
}

