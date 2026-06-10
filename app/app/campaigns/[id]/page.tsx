import { notFound } from "next/navigation";

import {
  AISummaryCard,
  CampaignStatusBadge,
  CampaignTabs,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/product-components";
import { Badge } from "@/components/ui/badge";
import { campaigns, getCampaign } from "@/lib/mock-data";

type CampaignDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return campaigns.map((campaign) => ({ id: campaign.id }));
}

export default async function CampaignDetailPage({ params }: CampaignDetailProps) {
  const { id } = await params;
  const campaign = getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={campaign.type}
        title={campaign.name}
        description={campaign.goal}
        action={<CampaignStatusBadge status={campaign.status} />}
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <AISummaryCard>
          <div className="space-y-3">
            <p><strong>Situation:</strong> {campaign.summary.situation}</p>
            <p><strong>Progress:</strong> {campaign.summary.progress}</p>
            <p><strong>Blockers:</strong> {campaign.summary.blockers}</p>
            <p><strong>Health:</strong> {campaign.summary.health}</p>
            <div className="flex flex-wrap gap-2">{campaign.summary.nextPriorities.map((item) => <Badge key={item}>{item}</Badge>)}</div>
          </div>
        </AISummaryCard>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Campaign progress</p>
            <span className="text-sm font-semibold">{campaign.progress}%</span>
          </div>
          <div className="mt-4"><ProgressBar value={campaign.progress} /></div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{campaign.channel}</Badge>
            <Badge>{campaign.deadline}</Badge>
            <Badge>{campaign.owner}</Badge>
          </div>
        </div>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Contacted" value={String(campaign.targets - campaign.blocked)} detail="Targets touched" />
        <StatCard label="Replied" value={String(campaign.replies)} detail="Replies to handle" tone="text-emerald-700" />
        <StatCard label="Follow-ups due" value={String(campaign.followUpsDue)} detail="Manual actions" tone="text-violet-700" />
        <StatCard label="Completed" value={String(campaign.completed)} detail="Closed targets" tone="text-blue-700" />
        <StatCard label="Blocked" value={String(campaign.blocked)} detail="Need source or owner" tone="text-rose-700" />
      </div>
      <CampaignTabs campaignId={campaign.id} />
    </>
  );
}

