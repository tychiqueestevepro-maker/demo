import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CampaignDirectory, PageHeader } from "@/components/product-components";
import { campaigns } from "@/lib/mock-data";

export default function CampaignsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Campaigns"
        title="Manual follow-up workspaces"
        description="Track each campaign with the few signals that matter: due actions, replies, blockers, progress, owner, and manual channels."
        action={<Button asChild variant="accent"><Link href="/app/campaigns/new"><Plus className="h-4 w-4" />Create workspace</Link></Button>}
      />
      <CampaignDirectory rows={campaigns} />
    </>
  );
}
