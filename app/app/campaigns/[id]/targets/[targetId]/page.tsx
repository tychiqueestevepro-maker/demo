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
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type TargetPageProps = {
  params: Promise<{ id: string; targetId: string }>;
};

export default async function TargetDetailPage({ params }: TargetPageProps) {
  const { id, targetId } = await params;
  const { userId } = await getServerUser();

  const campaign = await prisma.campaign.findUnique({ where: { id, userId } });
  
  const targetRecord = await prisma.campaignTarget.findUnique({
    where: { id: targetId, userId },
    include: {
      currentStage: true,
      followUps: true,
      activityLogs: { orderBy: { createdAt: "desc" } }
    }
  });

  const playbook = await prisma.campaignPlaybook.findFirst({
    where: { campaignId: id, userId },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!campaign || !targetRecord) {
    notFound();
  }

  const stages = playbook?.stages || [];

  const target = {
    id: targetRecord.id,
    name: targetRecord.name,
    company: targetRecord.company || "Unknown Company",
    role: targetRecord.role || "Unknown Role",
    email: targetRecord.email || "No email",
    status: targetRecord.status.replace(/_/g, " "),
    priority: targetRecord.priority,
    currentStep: targetRecord.currentStage?.name || "Initial",
    nextAction: targetRecord.aiRecommendedAction || "Follow up",
    summary: {
      why: "they match the target profile",
      happened: "we sent an initial outreach",
      blocker: targetRecord.aiRisk || "waiting for their reply",
      next: targetRecord.aiRecommendedAction || "send a follow-up message",
    }
  };

  try {
    if (targetRecord.aiSummary && targetRecord.aiSummary.trim().startsWith("{")) {
      const parsed = JSON.parse(targetRecord.aiSummary);
      target.summary = { ...target.summary, ...parsed };
    }
  } catch(e) {}

  const events = targetRecord.activityLogs.map((log) => ({
    id: log.id,
    date: "Just now", // Format this properly if needed
    title: log.type.replace(/_/g, " "),
    description: log.message,
    icon: log.type.includes("EMAIL") ? "email" : "system",
    tone: "neutral" as any,
  }));

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
              <TargetStatusBadge status={target.status as any} />
              <PriorityBadge priority={target.priority as any} />
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
        <ConversationContext target={target as any} events={events as any} />
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
        <TargetSequence stages={stages as any} currentStep={target.currentStep} />
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
