import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import {
  AISummaryCard,
  ConversationContext,
  MessagePreviewModal,
  PageHeader,
  PriorityBadge,
  TargetSequence,
  TargetDataDirectory,
  TargetStatusBadge,
} from "@/components/product-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampaign, getPlaybook, getTarget, targets, timelineEvents } from "@/lib/mock-data";

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
  const stages = getPlaybook(id);

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
          <p className="text-sm leading-relaxed text-neutral-700">
            Based on the conversation history and campaign timeline, we are currently at the <strong>{target.currentStep}</strong> stage. 
            {target.name} from {target.company} is in this campaign because {target.summary.why.toLowerCase()}. 
            Currently, {target.summary.happened.toLowerCase()}, but {target.summary.blocker.toLowerCase()}. 
            The recommended next action is to <strong>{target.summary.next.toLowerCase()}</strong>. Please review the recommended message below and manually validate the follow-up, reject it, or confirm the prospect if the goal has been reached.
          </p>
        </AISummaryCard>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle>Next recommended action</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-neutral-600">{target.nextAction}</p>
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6">{nextMessage}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-700">Validate follow-up</Button>
              <Button size="sm" variant="secondary" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">Confirm prospect</Button>
              <Button size="sm" variant="secondary" className="border-rose-200 text-rose-700 hover:bg-rose-50">Reject</Button>
            </div>
          </CardContent>
        </Card>
        <ConversationContext target={target} events={timelineEvents.filter((event) => event.targetId === target.id)} />
      </div>
      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#120b2f]">Follow-up Sequence</h2>
            <p className="text-sm text-neutral-500 mt-1">Current steps and actions planned for this prospect.</p>
          </div>
          <Button variant="secondary" className="gap-2 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200">
            <Sparkles className="h-4 w-4" />
            Update sequence with AI
          </Button>
        </div>
        <TargetSequence stages={stages} currentStep={target.currentStep} />
      </div>
      <div className="mt-6">
        <PageHeader title="Prospect notes and documents" description="Notes, profile links, conversation details, campaign documents, invoices, contracts, and custom links attached to this prospect." />
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
