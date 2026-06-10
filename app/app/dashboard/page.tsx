import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CampaignCard, DailyBriefing, FollowUpQueue, PageHeader, StatCard } from "@/components/product-components";
import { campaigns, dashboardStats, followUps } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="What should I do today?"
        description="A focused queue for replies, due follow-ups, blocked targets, and campaigns that need human review."
        action={<Button asChild variant="accent"><Link href="/app/campaigns/new">Create campaign<ArrowRight className="h-4 w-4" /></Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <DailyBriefing />
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Follow-ups due today</h2>
            <Button asChild size="sm" variant="secondary"><Link href="/app/follow-ups">Open queue</Link></Button>
          </div>
          <FollowUpQueue rows={followUps.slice(0, 3)} />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Campaigns needing review</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {campaigns.slice(0, 3).map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
        </div>
      </div>
    </>
  );
}

