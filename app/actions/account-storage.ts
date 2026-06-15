"use server";

import { MAX_DOCUMENT_BYTES, MAX_PROSPECTS_PER_CAMPAIGN, PROSPECTS_PER_PAGE, formatBytes } from "@/lib/account-limits";
import { getServerUser } from "@/lib/auth";
import { getAccountStorageUsage } from "@/lib/services/data-source-service";

export async function getAccountStorageAction() {
  const { userId } = await getServerUser();
  const usage = await getAccountStorageUsage(userId);

  return {
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
  };
}
