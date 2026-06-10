import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { generateCampaignPlaybook } from "@/lib/services/playbook-service";
import { generatePlaybookSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const input = generatePlaybookSchema.parse(await request.json());
    return ok(await generateCampaignPlaybook(userId, input));
  } catch (error) {
    return handleApiError(error);
  }
}

