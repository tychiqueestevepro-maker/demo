import { notFound } from "next/navigation";
import { Sparkles, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";

import {
  AISummaryCard,
  ConversationContext,
  MessagePreviewModal,
  PriorityBadge,
  TargetActionButton,
  TargetDataDirectory,
  TargetSequence,
} from "@/components/product-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { personalizeMessage } from "@/lib/message-template";
import type { PlaybookStage, Priority, Target as TargetRecord, TimelineEvent } from "@/lib/mock-data";

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
      activityLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  const playbook = await prisma.campaignPlaybook.findFirst({
    where: { campaignId: id, userId },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!campaign || !targetRecord) {
    notFound();
  }


  const stages: PlaybookStage[] = (playbook?.stages ?? []).map((stage) => ({
    id: stage.id,
    campaignId: stage.campaignId,
    title: stage.name,
    delay: `Day ${stage.delayDays}`,
    status: "Ready",
    condition: stage.condition || stage.goalOfStage || "",
    message: personalizeMessage(stage.messageBody || "", {
      name: targetRecord.name,
      company: targetRecord.company,
      role: targetRecord.role,
      email: targetRecord.email,
      notes: targetRecord.notes,
    }),
  }));
  const currentStep = targetRecord.currentStage?.name || "Initial message";
  const nextAction =
    targetRecord.aiRecommendedAction ||
    (targetRecord.followUpCount === 0 ? "Send initial message" : "Review next follow-up");
  const priority = mapPriority(targetRecord.priority);

  const summary = parseTargetSummary(targetRecord.aiSummary, {
    who: `${targetRecord.name}${targetRecord.company ? ` at ${targetRecord.company}` : ""}`,
    why: "they match the target profile",
    happened: targetRecord.lastActionAt ? "a message was marked sent" : "the prospect is ready for the first message",
    blocker: targetRecord.aiRisk || "waiting for the next outcome",
    next: nextAction,
    sources: [],
  });

  const target: TargetRecord = {
    id: targetRecord.id,
    campaignId: targetRecord.campaignId,
    name: targetRecord.name,
    company: targetRecord.company || "Unknown Company",
    role: targetRecord.role || "Unknown Role",
    email: targetRecord.email || "No email",
    note: targetRecord.notes || "",
    status: "Not contacted",
    priority,
    currentStep,
    lastAction: targetRecord.lastActionAt ? targetRecord.lastActionAt.toLocaleDateString() : "No message marked sent yet",
    nextAction,
    due: targetRecord.nextActionAt ? targetRecord.nextActionAt.toLocaleDateString() : "Not scheduled",
    sourceCount: 0,
    summary,
  };
  const step = targetRecord.followUpCount;

  const events: TimelineEvent[] = targetRecord.activityLogs.map((log) => ({
    id: log.id,
    campaignId: log.campaignId,
    targetId: log.targetId ?? undefined,
    title: log.type.replace(/_/g, " "),
    description: log.message,
    time: log.createdAt.toLocaleDateString(),
  }));

  const hasConversationStarted = targetRecord.followUpCount > 0 || events.length > 0;
  const hasBothParties = events.some(e => e.title.toLowerCase().includes("repl") || e.title.toLowerCase().includes("receiv"));

  const nextMessage = personalizeMessage(
    targetRecord.currentStage?.messageBody || "Hi {{firstName}}, quick note about {{company}}.",
    {
      name: targetRecord.name,
      company: targetRecord.company,
      role: targetRecord.role,
      email: targetRecord.email,
      notes: targetRecord.notes,
    },
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 overflow-x-hidden">
      <section className="rounded-2xl border border-violet-500/15 bg-[radial-gradient(circle_at_92%_0%,rgba(167,139,250,0.18),transparent_32%),linear-gradient(135deg,#ffffff_0%,#fbf9ff_100%)] p-5 shadow-xl shadow-violet-950/8 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Badge tone="violet">{campaign.name}</Badge>
            <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#120b2f] sm:text-4xl">{target.name}</h1>
            <p className="mt-2 break-words text-sm text-neutral-500 sm:text-base">{target.role} at {target.company}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Badge tone="violet">Step {step}</Badge>
            <Badge>{target.currentStep}</Badge>
            <PriorityBadge priority={target.priority} />
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div id="follow-up" className="min-w-0 scroll-mt-6">
          <Card className="h-full">
            <CardHeader><CardTitle>{targetRecord.status === "COMPLETED" || targetRecord.status === "INTERESTED" || targetRecord.status === "STOPPED" || targetRecord.status === "NOT_INTERESTED" ? "Final Result" : "Action to do"}</CardTitle></CardHeader>
            <CardContent>
              {targetRecord.status === "COMPLETED" || targetRecord.status === "INTERESTED" ? (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                  Prospect validated
                </div>
              ) : targetRecord.status === "STOPPED" || targetRecord.status === "NOT_INTERESTED" ? (
                <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700 font-medium">
                  <XCircle className="h-6 w-6 shrink-0" />
                  Prospect refused
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="violet">Step {step}</Badge>
                    <Badge>{target.currentStep}</Badge>
                  </div>
                  <p className="mt-4 break-words text-sm leading-6 text-neutral-600">{target.nextAction}</p>
                  <div className="mt-4 max-h-[260px] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-[#120b2f]">
                    {nextMessage}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <MessagePreviewModal label="Copy next" message={nextMessage} />
                    <TargetActionButton targetId={target.id} endpoint="mark-sent" label="Next step" />
                    <TargetActionButton targetId={target.id} endpoint="mark-completed" label="Prospect validated" tone="emerald" />
                    <TargetActionButton targetId={target.id} endpoint="stop" label="Rejected" tone="rose" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 gap-5">
          <Card>
            <CardHeader><CardTitle>Target profile</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Info label="Company" value={targetRecord.company ?? "—"} />
              <Info label="Role" value={targetRecord.role ?? "—"} />
              <Info label="Contact" value={
                <div className="flex items-center sm:justify-end gap-2">
                  {targetRecord.email ? (
                    <a href={`mailto:${targetRecord.email}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200" title={`Email: ${targetRecord.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400" title="No email">
                      <Mail className="h-4 w-4" />
                    </div>
                  )}
                  {targetRecord.phone ? (
                    <a href={`tel:${targetRecord.phone}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200" title={`Phone: ${targetRecord.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400" title="No phone">
                      <Phone className="h-4 w-4" />
                    </div>
                  )}
                  {targetRecord.profileUrl ? (
                    <a href={targetRecord.profileUrl} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200" title={`LinkedIn: ${targetRecord.profileUrl}`}>
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400" title="No LinkedIn">
                      <LinkedinIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              } />
            </CardContent>
          </Card>
          <AISummaryCard title="AI target summary">
            {hasConversationStarted ? (
              <p className="break-words text-sm leading-relaxed text-neutral-700">
                Based on the campaign timeline, we are currently at the <strong>{target.currentStep}</strong> stage.
                {" "}{target.name} from {target.company} is in this campaign because {target.summary.why.toLowerCase()}.
                {" "}Currently, {target.summary.happened.toLowerCase()}, but {target.summary.blocker.toLowerCase()}.
                {" "}The recommended next action is to <strong>{target.summary.next.toLowerCase()}</strong>.
              </p>
            ) : (
              <p className="break-words text-sm text-neutral-500 italic">
                Summary will be generated once the conversation starts.
              </p>
            )}
          </AISummaryCard>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-[#120b2f]">Follow-up Sequence</h2>
            <p className="mt-1 text-sm text-neutral-500">Current steps and actions planned for this prospect.</p>
          </div>
          <Button 
            variant="secondary" 
            className="w-full gap-2 border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 sm:w-auto disabled:opacity-50 disabled:hover:bg-violet-50"
            disabled={!hasBothParties}
            title={!hasBothParties ? "Requires conversation history from both parties" : "Update sequence with AI"}
          >
            <Sparkles className="h-4 w-4" />
            Update sequence with AI
          </Button>
        </div>
        <TargetSequence stages={stages} currentStep={target.currentStep} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-w-0">
          <ConversationContext target={target} events={events} />
        </div>
        <div className="min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-[#120b2f]">Prospect notes and documents</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">Notes, profile links, conversation details, campaign documents, invoices, contracts, and custom links attached to this prospect.</p>
          </div>
          <TargetDataDirectory targetId={target.id} />
        </div>
      </section>
    </div>
  );
}

function parseTargetSummary(
  value: string | null,
  fallback: TargetRecord["summary"],
) {
  if (!value?.trim().startsWith("{")) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as Partial<typeof fallback>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function mapPriority(priority: string): Priority {
  if (priority === "HIGH" || priority === "URGENT") {
    return "High";
  }

  if (priority === "LOW") {
    return "Low";
  }

  return "Medium";
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-md bg-neutral-50 px-3 py-2 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center">
      <span className="text-neutral-500">{label}</span>
      <div className="min-w-0 break-words font-medium text-neutral-950 sm:text-right flex items-center sm:justify-end">
        {value}
      </div>
    </div>
  );
}
