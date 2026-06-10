import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CampaignCard, CampaignTable, FilterBar, PageHeader } from "@/components/product-components";
import { campaigns } from "@/lib/mock-data";

export default function CampaignsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Campaigns"
        title="Campaign cockpit"
        description="Compare active, waiting, blocked, completed, prospecting, recruiting, HR, client request, and invoice workflows."
        action={<Button asChild variant="accent"><Link href="/app/campaigns/new"><Plus className="h-4 w-4" />New campaign</Link></Button>}
      />
      <FilterBar filters={["Active", "Waiting", "Blocked", "Completed", "Prospecting", "Recruiting", "HR", "Client request", "Invoice"]} />
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        {campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
      </div>
      <div className="mt-6">
        <CampaignTable rows={campaigns} />
      </div>
    </>
  );
}

