import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MessageCircle, Plus, Users } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const { userId } = await getServerUser();

  const repliesCount = await prisma.followUp.count({
    where: { userId, status: "REPLIED" },
  });

  const dueFollowUps = await prisma.followUp.findMany({
    where: { userId, status: "DUE" },
    orderBy: { dueAt: "asc" },
    include: { target: true, campaign: true },
    take: 10,
  });

  const targetsCount = await prisma.campaignTarget.count({
    where: { userId },
  });

  const activeCampaignsData = await prisma.campaign.findMany({
    where: { userId, status: { in: ["ACTIVE", "WAITING"] } },
    include: {
      targets: true,
      followUps: true,
    },
  });

  const activeCampaigns = activeCampaignsData.map((campaign) => {
    const totalTargets = campaign.targets.length;
    const completed = campaign.targets.filter((t) => t.status === "COMPLETED" || t.status === "INTERESTED").length;
    const replies = campaign.targets.filter((t) => t.status === "REPLIED").length;
    const followUpsDue = campaign.followUps.filter((f) => f.status === "DUE").length;
    const progress = totalTargets > 0 ? Math.round((completed / totalTargets) * 100) : 0;

    return {
      ...campaign,
      totalTargets,
      completed,
      replies,
      followUpsDue,
      progress,
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-violet-500/15 bg-white p-6 shadow-xl shadow-violet-950/5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="violet">Today</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#120b2f]">Manual follow-up desk</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#120b2f]/58">
              Review replies, prepare the next messages, then open each campaign only when context needs attention.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="accent">
              <Link href="/app/follow-ups">Open follow-up queue<ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app/campaigns/new"><Plus className="h-4 w-4" />New campaign</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <SnapshotCard icon={<MessageCircle className="h-5 w-5" />} label="Replies waiting" value={String(repliesCount)} tone="emerald" />
          <SnapshotCard icon={<Clock3 className="h-5 w-5" />} label="Due today" value={String(dueFollowUps.length)} tone="violet" />
          <SnapshotCard icon={<Users className="h-5 w-5" />} label="Targets tracked" value={String(targetsCount)} tone="blue" />
          <SnapshotCard icon={<CheckCircle2 className="h-5 w-5" />} label="Campaigns running" value={String(activeCampaigns.length)} tone="amber" />
        </div>
      </section>

      <section>
        <Card className="rounded-3xl border-violet-500/15 shadow-xl shadow-violet-950/5">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Work queue</CardTitle>
              <p className="mt-1 text-sm text-[#120b2f]/55">The next manual actions, ordered by conversation value.</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/follow-ups">View all<ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueFollowUps.length === 0 && (
              <div className="rounded-2xl border border-violet-500/10 bg-violet-50/50 p-6 text-center text-sm text-[#120b2f]/58">
                No follow-ups due right now.
              </div>
            )}
            {dueFollowUps.map((item, index) => (
              <Link
                key={item.id}
                href={`/app/campaigns/${item.campaignId}/targets/${item.targetId}`}
                className="grid gap-3 rounded-2xl border border-violet-500/10 bg-violet-50/50 p-4 transition hover:border-violet-400 hover:bg-violet-50 md:grid-cols-[48px_minmax(0,1fr)_auto]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-bold text-violet-700 shadow-sm">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[#120b2f]">{item.target.name}</span>
                  <span className="mt-1 block text-sm leading-6 text-[#120b2f]/58">{item.reason || "Follow-up due"}</span>
                  <span className="mt-2 block text-xs font-semibold text-violet-700">{item.campaign.name}</span>
                </span>
                <span className="flex flex-wrap items-start gap-2 md:justify-end">
                  <Badge tone={item.priority === "HIGH" || item.priority === "URGENT" ? "rose" : item.priority === "MEDIUM" ? "amber" : "blue"}>{item.priority}</Badge>
                  <Badge>{format(new Date(item.dueAt), "MMM d")}</Badge>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#120b2f]">Campaign pulse</h2>
          <Button asChild size="sm" variant="secondary"><Link href="/app/campaigns">Open campaigns</Link></Button>
        </div>
        <div className="space-y-3">
          {activeCampaigns.length === 0 && (
            <div className="rounded-3xl border border-violet-500/15 bg-white p-6 text-center text-sm text-[#120b2f]/58 shadow-xl shadow-violet-950/5">
              No active campaigns.
            </div>
          )}
          {activeCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/app/campaigns/${campaign.id}`}
              className="grid gap-4 rounded-3xl border border-violet-500/15 bg-white p-4 shadow-xl shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-violet-400 lg:grid-cols-[minmax(0,1fr)_360px_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-[#120b2f]">{campaign.name}</p>
                  <Badge tone="emerald">{campaign.type.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#120b2f]/55">{campaign.goal}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#120b2f]/45">
                  {campaign.deadline && <span>Deadline: {format(new Date(campaign.deadline), "MMM d, yyyy")}</span>}
                  {campaign.channel && <span>{campaign.channel}</span>}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#120b2f]/55">
                  <span>{campaign.progress}% complete</span>
                  <span>{campaign.totalTargets} targets</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-violet-100">
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${campaign.progress}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniMetric label="Due" value={campaign.followUpsDue} />
                  <MiniMetric label="Replies" value={campaign.replies} />
                  <MiniMetric label="Done" value={campaign.completed} />
                </div>
              </div>

              <span className="flex items-center justify-end">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-xl bg-violet-50 px-3 py-2">
      <span className="block text-sm font-bold text-[#120b2f]">{value}</span>
      <span className="text-[11px] font-semibold text-[#120b2f]/45">{label}</span>
    </span>
  );
}

function SnapshotCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "violet" | "blue" | "amber";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-violet-500/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>{icon}</span>
        <span className="text-2xl font-bold text-[#120b2f]">{value}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-[#120b2f]/58">{label}</p>
    </div>
  );
}

