import { notFound } from "next/navigation";

import {
  AISummaryCard,
  MessagePreviewModal,
  PageHeader,
  PriorityBadge,
  TargetDataDirectory,
  TargetStatusBadge,
  Timeline,
} from "@/components/product-components";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampaign, getTarget, targets, timelineEvents } from "@/lib/mock-data";

type TargetPageProps = {
  params: Promise<{ id: string; targetId: string }>;
};

export async function generateStaticParams() {
  return targets.map((target) => ({ id: target.campaignId, targetId: target.id }));
}

export default async function TargetDetailPage({ params }: TargetPageProps) {
  const { id, targetId } = await params;
  const campaign = getCampaign(id);
  const target = getTarget(targetId);

  if (!campaign || !target) {
    notFound();
  }

  const nextMessage = `Hi ${target.name.split(" ")[0]}, quick follow-up on ${target.nextAction.toLowerCase()}.`;

  return (
    <>
      <PageHeader eyebrow={campaign.name} title={target.name} description={`${target.role} at ${target.company}`} />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle>Target profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Company" value={target.company} />
            <Info label="Role" value={target.role} />
            <Info label="Email / link" value={target.email} />
            <div className="flex flex-wrap gap-2">
              <TargetStatusBadge status={target.status} />
              <PriorityBadge priority={target.priority} />
              <Badge>{target.currentStep}</Badge>
            </div>
          </CardContent>
        </Card>
        <AISummaryCard title="AI target summary">
          <div className="grid gap-3 md:grid-cols-2">
            <p><strong>Who they are:</strong> {target.summary.who}</p>
            <p><strong>Why included:</strong> {target.summary.why}</p>
            <p><strong>What happened:</strong> {target.summary.happened}</p>
            <p><strong>Current blocker:</strong> {target.summary.blocker}</p>
            <p><strong>Next action:</strong> {target.summary.next}</p>
            <div><strong>Relevant sources:</strong><div className="mt-2 flex flex-wrap gap-2">{target.summary.sources.map((source) => <Badge key={source}>{source}</Badge>)}</div></div>
          </div>
        </AISummaryCard>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle>Next recommended action</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-neutral-600">{target.nextAction}</p>
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6">{nextMessage}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <MessagePreviewModal label="Copy next message" message={nextMessage} />
              <Badge tone="emerald">Manual send only</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>History</CardTitle></CardHeader>
          <CardContent><Timeline events={timelineEvents.filter((event) => event.targetId === target.id)} /></CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <PageHeader title="Target data directory" description="LinkedIn, email thread, CRM record, Drive folder, documents, invoices, contracts, notes, and custom links." />
        <TargetDataDirectory targetId={target.id} />
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-neutral-50 px-3 py-2">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-950">{value}</span>
    </div>
  );
}
