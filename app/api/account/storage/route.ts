import { NextRequest } from "next/server";

import { MAX_DOCUMENT_BYTES, MAX_PROSPECTS_PER_CAMPAIGN, PROSPECTS_PER_PAGE, formatBytes } from "@/lib/account-limits";
import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { getAccountStorageUsage } from "@/lib/services/data-source-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const usage = await getAccountStorageUsage(userId);

    return ok({
      ...usage,
      usedLabel: formatBytes(usage.usedBytes),
      limitLabel: formatBytes(usage.limitBytes),
      remainingLabel: formatBytes(usage.remainingBytes),
      percentUsed: usage.limitBytes > 0 ? Math.round((usage.usedBytes / usage.limitBytes) * 100) : 0,
      limits: {
        prospectsPerPage: PROSPECTS_PER_PAGE,
        prospectsPerCampaign: MAX_PROSPECTS_PER_CAMPAIGN,
        documentBytes: MAX_DOCUMENT_BYTES,
        documentLabel: formatBytes(MAX_DOCUMENT_BYTES),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
