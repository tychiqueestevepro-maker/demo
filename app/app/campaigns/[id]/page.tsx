import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import {
  AISummaryCard,
  CampaignStatusBadge,
  CampaignTabs,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/product-components";
import { Badge } from "@/components/ui/badge";
import { CampaignControls } from "@/components/campaign-controls";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type CampaignDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignDetailProps) {
  const { id } = await params;

  let userId: string;
  try {
    const user = await getServerUser();
    userId = user.userId;
  } catch {
    redirect("/login");
  }

  const campaignRecord = await prisma.campaign.findUnique({
    where: { id, userId },
    include: {
      targets: { orderBy: { createdAt: "desc" } },
      followUps: {
        include: { target: true },
        orderBy: { dueAt: "asc" },
      },
      dataSources: { orderBy: { createdAt: "desc" } },
      playbooks: {
        include: { stages: { orderBy: { order: "asc" } } },
        take: 1,
      },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      user: true,
    },
  });

  if (!campaignRecord) notFound();

  const totalTargets = campaignRecord.targets.length;
  const completed = campaignRecord.targets.filter((t) => t.status === "COMPLETED" || t.status === "INTERESTED").length;
  const replies = campaignRecord.targets.filter((t) => t.status === "REPLIED").length;
  const blocked = campaignRecord.targets.filter((t) => t.status === "STOPPED" || t.status === "NOT_INTERESTED").length;
  const followUpsDue = campaignRecord.followUps.filter((f) => f.status === "DUE" || f.status === "PENDING").length;
  const progress = totalTargets > 0 ? Math.round((completed / totalTargets) * 100) : 0;

  const summary = {
    situation: campaignRecord.aiSummary || "Campaign created. Add prospects to begin.",
    health: campaignRecord.aiHealth || "Getting started",
    progress: totalTargets === 0 ? "No prospects added yet." : `${completed}/${totalTargets} targets processed.`,
    blockers: blocked > 0 ? `${blocked} targets are blocked.` : "No major blockers.",
    nextPriorities:
      totalTargets === 0
        ? ["Add your first prospects in the Targets tab", "Attach campaign documents in Documents tab"]
        : ["Review due follow-ups", "Process replies"],
  };

  const status =
    campaignRecord.status === "DRAFT" ? "Review" :
    campaignRecord.status === "ACTIVE" ? "Active" :
    campaignRecord.status === "COMPLETED" ? "Completed" : "Waiting";

  const ownerName = campaignRecord.user.name || campaignRecord.user.email || "Unknown";
  const deadlineText = campaignRecord.deadline
    ? format(new Date(campaignRecord.deadline), "MMM d, yyyy")
    : "No deadline";

  const targetsData = campaignRecord.targets.map((t) => ({
    id: t.id,
    campaignId: t.campaignId,
    name: t.name,
    company: t.company || "",
    role: t.role || "",
    email: t.email || "",
    note: t.notes || "",
    status: t.status,
    priority: t.priority,
    currentStep: "",
    lastAction: t.lastActionAt ? format(new Date(t.lastActionAt), "MMM d") : "—",
    nextAction: t.aiRecommendedAction || "—",
    due: t.nextActionAt ? format(new Date(t.nextActionAt), "MMM d") : "—",
    sourceCount: 0,
    summary: {
      who: t.aiSummary || "",
      why: "",
      happened: "",
      blocker: t.aiRisk || "",
      next: t.aiRecommendedAction || "",
      sources: [],
    },
  }));

  const playbookStagesData = (campaignRecord.playbooks[0]?.stages ?? []).map((s) => ({
    id: s.id,
    campaignId: s.campaignId,
    title: s.name,
    delay: `Day ${s.delayDays}`,
    status: "Ready" as const,
    condition: s.condition || s.goalOfStage || "",
    message: s.messageBody,
  }));

  const dataSourcesData = campaignRecord.dataSources.map((d) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    url: d.url || "",
    description: d.description || "",
    campaignId: d.campaignId || id,
    targetId: d.targetId || undefined,
    linkedCampaign: campaignRecord.name,
    importance: d.importance,
    lastChecked: d.lastCheckedAt ? format(new Date(d.lastCheckedAt), "MMM d") : "Never",
    missing: false,
  }));

  const followUpsData = campaignRecord.followUps.map((f) => ({
    id: f.id,
    campaignId: f.campaignId,
    targetId: f.targetId,
    target: f.target.name,
    campaign: campaignRecord.name,
    type: "Email",
    reason: f.messageSubject || "Follow-up",
    priority: f.priority,
    status: f.status,
    due: format(new Date(f.dueAt), "MMM d"),
    dueDate: format(new Date(f.dueAt), "MMM d"),
    missingContext: false,
    messagePreview: f.messageBody,
    message: f.messageBody,
    step: "",
  }));

  const activityData = campaignRecord.activityLogs.map((a) => ({
    id: a.id,
    campaignId: a.campaignId,
    title: a.type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    description: a.message,
    time: format(new Date(a.createdAt), "MMM d, HH:mm"),
    targetId: a.targetId ?? undefined,
  }));

  return (
    <>
      <PageHeader
        eyebrow={campaignRecord.type.replace(/_/g, " ")}
        title={campaignRecord.name}
        description={campaignRecord.goal}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <CampaignStatusBadge status={status as any} />
            <CampaignControls
              campaignId={campaignRecord.id}
              currentStatus={campaignRecord.status}
            />
          </div>
        }
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <AISummaryCard>
          <div className="space-y-3">
            <p><strong>Situation:</strong> {summary.situation}</p>
            <p><strong>Progress:</strong> {summary.progress}</p>
            <p><strong>Blockers:</strong> {summary.blockers}</p>
            <p><strong>Health:</strong> {summary.health}</p>
            <div className="flex flex-wrap gap-2">
              {summary.nextPriorities.map((item) => <Badge key={item}>{item}</Badge>)}
            </div>
          </div>
        </AISummaryCard>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Campaign progress</p>
            <span className="text-sm font-semibold">{progress}%</span>
          </div>
          <div className="mt-4"><ProgressBar value={progress} /></div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{campaignRecord.channel || "Email"}</Badge>
            <Badge>{deadlineText}</Badge>
            <Badge>{ownerName}</Badge>
          </div>
        </div>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Prospects" value={String(totalTargets)} detail="Total added" />
        <StatCard label="Replied" value={String(replies)} detail="Replies to handle" tone="text-emerald-700" />
        <StatCard label="Follow-ups due" value={String(followUpsDue)} detail="Manual actions" tone="text-violet-700" />
        <StatCard label="Completed" value={String(completed)} detail="Closed targets" tone="text-blue-700" />
        <StatCard label="Blocked" value={String(blocked)} detail="Need attention" tone="text-rose-700" />
      </div>
      <CampaignTabs
        campaignId={campaignRecord.id}
        targets={targetsData as any}
        playbookStages={playbookStagesData}
        dataSources={dataSourcesData as any}
        followUps={followUpsData as any}
        activityEvents={activityData}
      />
    </>
  );
}
