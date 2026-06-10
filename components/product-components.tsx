"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  Database,
  FileText,
  Filter,
  Flag,
  Gauge,
  Home,
  Inbox,
  Layers3,
  MailCheck,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  Table2,
  X,
} from "lucide-react";

import {
  campaignTypeOptions,
  campaigns,
  dataSources,
  emptyStateExamples,
  followUps,
  getPlaybook,
  getSourcesForCampaign,
  getSourcesForTarget,
  getTargetsForCampaign,
  playbookStages,
  recentUpdates,
  targets,
  type Campaign,
  type CampaignStatus,
  type CampaignType,
  type DataSource,
  type FollowUp,
  type PlaybookStage,
  type Priority,
  type Target as TargetRecord,
  type TargetStatus,
  type TimelineEvent,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: Home },
  { label: "Campaigns", href: "/app/campaigns", icon: Layers3 },
  { label: "Create Campaign", href: "/app/campaigns/new", icon: Plus },
  { label: "Follow-ups", href: "/app/follow-ups", icon: CalendarClock },
  { label: "Data Directory", href: "/app/data-directory", icon: Database },
  { label: "Templates", href: "/app/templates", icon: FileText },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

const statusTones: Record<CampaignStatus | TargetStatus, React.ComponentProps<typeof Badge>["tone"]> = {
  Active: "emerald",
  Waiting: "amber",
  Blocked: "rose",
  Completed: "blue",
  Review: "violet",
  "Not contacted": "neutral",
  Contacted: "violet",
  Replied: "emerald",
  Snoozed: "amber",
};

const priorityTones: Record<Priority, React.ComponentProps<typeof Badge>["tone"]> = {
  High: "rose",
  Medium: "amber",
  Low: "blue",
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-neutral-200 bg-white/80 px-4 py-5 backdrop-blur lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-950 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-950">FollowPilot</p>
          <p className="text-xs text-neutral-500">Campaign cockpit</p>
        </div>
      </Link>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-600 transition",
                active && "bg-neutral-950 text-white shadow-sm",
                !active && "hover:bg-neutral-100 hover:text-neutral-950",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 rounded-lg border border-violet-100 bg-violet-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-900">
          <Bot className="h-4 w-4" />
          AI briefing
        </div>
        <p className="text-sm leading-6 text-violet-800">
          19 follow-ups are due today. Start with replies, then source-blocked targets.
        </p>
      </div>
    </aside>
  );
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-neutral-200 bg-[#f7f5f0]/90 px-4 backdrop-blur md:px-6">
      <SearchInput placeholder="Search campaigns, targets, sources..." />
      <Button asChild className="hidden sm:inline-flex" variant="accent">
        <Link href="/app/campaigns/new">
          <Plus className="h-4 w-4" />
          Create campaign
        </Link>
      </Button>
      <button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-md border border-neutral-200 bg-white text-neutral-600 shadow-sm">
        <Bell className="h-4 w-4" />
      </button>
      <div className="grid h-10 w-10 place-items-center rounded-full bg-neutral-950 text-sm font-semibold text-white">MC</div>
    </header>
  );
}

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  return (
    <label className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input className="pl-9" placeholder={placeholder} />
    </label>
  );
}

export function StatCard({ label, value, detail, tone = "text-neutral-950" }: { label: string; value: string; detail: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            <p className={cn("mt-2 text-3xl font-bold tracking-tight", tone)}>{value}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-md bg-neutral-100 text-neutral-600">
            <Gauge className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-sm text-neutral-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function TargetStatusBadge({ status }: { status: TargetStatus }) {
  return <Badge tone={statusTones[status]}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTones[priority]}>{priority}</Badge>;
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge tone={statusTones[status]}>{status}</Badge>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div className="h-full rounded-full bg-neutral-950 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(17,17,17,0.08)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription>{campaign.goal}</CardDescription>
          </div>
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge tone="violet">{campaign.type}</Badge>
          <Badge>{campaign.channel}</Badge>
          <Badge>{campaign.deadline}</Badge>
        </div>
        <ProgressBar value={campaign.progress} />
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <Metric label="Targets" value={String(campaign.targets)} />
          <Metric label="Due" value={String(campaign.followUpsDue)} />
          <Metric label="Replies" value={String(campaign.replies)} />
        </div>
        <Button asChild className="mt-5 w-full" variant="secondary">
          <Link href={`/app/campaigns/${campaign.id}`}>
            Open campaign
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-neutral-50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

export function CampaignTypeCard({ option, active, onClick }: { option: (typeof campaignTypeOptions)[number]; active?: boolean; onClick?: () => void }) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full flex-col items-start gap-3 rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5",
        active ? "border-violet-400 ring-2 ring-violet-100" : "border-neutral-200",
      )}
    >
      <div className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-neutral-950">{option.title}</p>
        <p className="mt-1 text-sm leading-6 text-neutral-500">{option.description}</p>
      </div>
    </button>
  );
}

export function FilterBar({ filters }: { filters: string[] }) {
  const [active, setActive] = React.useState(filters[0]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="neutral" className="rounded-md">
        <Filter className="h-3.5 w-3.5" />
        Filters
      </Badge>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActive(filter)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition",
            active === filter ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export function CampaignTable({ rows = campaigns }: { rows?: Campaign[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              {["Campaign name", "Type", "Goal", "Status", "Targets", "Progress", "Due", "Last activity", "Owner"].map((head) => (
                <th className="px-4 py-3 font-semibold" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-neutral-50/70">
                <td className="px-4 py-4 font-semibold text-neutral-950">
                  <Link href={`/app/campaigns/${campaign.id}`}>{campaign.name}</Link>
                </td>
                <td className="px-4 py-4"><Badge tone="violet">{campaign.type}</Badge></td>
                <td className="max-w-xs px-4 py-4 text-neutral-600">{campaign.goal}</td>
                <td className="px-4 py-4"><CampaignStatusBadge status={campaign.status} /></td>
                <td className="px-4 py-4">{campaign.targets}</td>
                <td className="px-4 py-4"><div className="w-28"><ProgressBar value={campaign.progress} /></div></td>
                <td className="px-4 py-4">{campaign.followUpsDue}</td>
                <td className="px-4 py-4 text-neutral-500">{campaign.lastActivity}</td>
                <td className="px-4 py-4">{campaign.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TargetTable({ rows }: { rows: TargetRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              {["Target", "Status", "Current step", "Priority", "Last action", "Next action", "Due", "Sources", "Actions"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((target) => (
              <tr key={target.id} className="hover:bg-neutral-50/70">
                <td className="px-4 py-4">
                  <Link href={`/app/campaigns/${target.campaignId}/targets/${target.id}`} className="font-semibold text-neutral-950">{target.name}</Link>
                  <p className="text-xs text-neutral-500">{target.role}, {target.company}</p>
                </td>
                <td className="px-4 py-4"><TargetStatusBadge status={target.status} /></td>
                <td className="px-4 py-4">{target.currentStep}</td>
                <td className="px-4 py-4"><PriorityBadge priority={target.priority} /></td>
                <td className="px-4 py-4 text-neutral-500">{target.lastAction}</td>
                <td className="px-4 py-4 text-neutral-700">{target.nextAction}</td>
                <td className="px-4 py-4">{target.due}</td>
                <td className="px-4 py-4">{target.sourceCount}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <MessagePreviewModal label="Copy next" message={`Hi ${target.name.split(" ")[0]}, quick follow-up on ${target.nextAction.toLowerCase()}.`} />
                    <Button size="sm" variant="ghost">Sent</Button>
                    <Button size="sm" variant="ghost">Replied</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AISummaryCard({ title = "AI Campaign Summary", children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-violet-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-neutral-700">{children}</CardContent>
    </Card>
  );
}

export function PlaybookStageCard({ stage }: { stage: PlaybookStage }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-950">{stage.title}</p>
            <p className="text-sm text-neutral-500">{stage.delay}</p>
          </div>
          <Badge tone={stage.status === "Ready" ? "emerald" : stage.status === "Editable" ? "violet" : "amber"}>{stage.status}</Badge>
        </div>
        <p className="mt-4 rounded-md bg-neutral-50 p-3 text-sm leading-6 text-neutral-600">{stage.message}</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
          <Flag className="h-3.5 w-3.5" />
          {stage.condition}
        </div>
      </CardContent>
    </Card>
  );
}

export function FollowUpQueue({ rows = followUps }: { rows?: FollowUp[] }) {
  return (
    <div className="space-y-3">
      {rows.map((followUp) => (
        <Card key={followUp.id}>
          <CardContent className="grid gap-4 pt-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={followUp.priority} />
                <Badge>{followUp.dueDate}</Badge>
                <Badge tone="violet">{followUp.step}</Badge>
              </div>
              <p className="font-semibold text-neutral-950">{followUp.target}</p>
              <p className="text-sm text-neutral-500">{followUp.campaign} - {followUp.reason}</p>
              <p className="mt-3 rounded-md bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">{followUp.message}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <MessagePreviewModal label="Copy message" message={followUp.message} />
              {/* Backend integration point: mark this manual send on the target timeline. */}
              <Button variant="secondary" size="sm">Mark sent</Button>
              <Button variant="ghost" size="sm">Snooze</Button>
              <Button variant="ghost" size="sm">Stop</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CopyMessageButton({ message }: { message: string }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <Button
      size="sm"
      variant={copied ? "subtle" : "secondary"}
      onClick={async () => {
        await navigator.clipboard?.writeText(message);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function MessagePreviewModal({ label = "Preview", message }: { label?: string; message: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="secondary">
          <Clipboard className="h-4 w-4" />
          {label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-neutral-950/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-neutral-950">Next message</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">Copy manually, send from your own channel, then mark the action.</Dialog.Description>
            </div>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-md hover:bg-neutral-100" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-800">{message}</div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <CopyMessageButton message={message} />
            {/* Backend integration point: record copied/sent state without sending automatically. */}
            <Button variant="secondary" size="sm">Mark sent</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DataSourceCard({ source }: { source: DataSource }) {
  return (
    <Card className={cn(source.missing && "border-amber-200 bg-amber-50/40")}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-neutral-950">{source.title}</p>
            <p className="text-sm text-neutral-500">{source.description}</p>
          </div>
          <PriorityBadge priority={source.importance} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone={source.missing ? "amber" : "blue"}>{source.type}</Badge>
          <Badge>{source.linkedCampaign}</Badge>
          {source.linkedTarget ? <Badge>{source.linkedTarget}</Badge> : null}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-neutral-500">
          <span>{source.lastChecked}</span>
          <DataSourceModal source={source} />
        </div>
      </CardContent>
    </Card>
  );
}

export function DataSourceModal({ source }: { source: DataSource }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="ghost">Open</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-neutral-950/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-neutral-950">{source.title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">{source.type}</Dialog.Description>
            </div>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-md hover:bg-neutral-100" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Campaign" value={source.linkedCampaign} />
            <InfoRow label="Target" value={source.linkedTarget ?? "Campaign-level source"} />
            <InfoRow label="URL" value={source.url} />
            <InfoRow label="Last checked" value={source.lastChecked} />
            <p className="rounded-md bg-neutral-50 p-3 leading-6 text-neutral-700">{source.description}</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-100 px-3 py-2">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-900">{value}</span>
    </div>
  );
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-3">
          <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-950 text-white">
            <Activity className="h-4 w-4" />
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="font-semibold text-neutral-950">{event.title}</p>
            <p className="mt-1 text-sm leading-6 text-neutral-600">{event.description}</p>
            <p className="mt-2 text-xs font-medium text-neutral-400">{event.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = "No records yet", description = "Add the first item to build campaign context." }: { title?: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-neutral-950 text-white">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{description}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {emptyStateExamples.map((example) => {
          const Icon = example.icon;
          return (
            <div key={example.title} className="rounded-lg border border-neutral-200 p-4 text-left">
              <Icon className="h-4 w-4 text-neutral-600" />
              <p className="mt-2 text-sm font-semibold text-neutral-950">{example.title}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{example.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConfirmDialog({ label = "Confirm", title = "Confirm action", description = "This will update the local mock state for the MVP." }: { label?: string; title?: string; description?: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="ghost">{label}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-neutral-950/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-5 shadow-2xl">
          <Dialog.Title className="text-lg font-semibold text-neutral-950">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-neutral-500">{description}</Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild><Button variant="secondary" size="sm">Cancel</Button></Dialog.Close>
            <Dialog.Close asChild><Button size="sm">Confirm</Button></Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const wizardSchema = z.object({
  name: z.string().min(2),
  goal: z.string().min(8),
  audience: z.string().min(2),
});

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="grid gap-2 md:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step} className={cn("rounded-lg border p-3", current === index ? "border-neutral-950 bg-neutral-950 text-white" : index < current ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 bg-white text-neutral-500")}>
          <p className="text-xs font-semibold">Step {index + 1}</p>
          <p className="mt-1 text-sm font-semibold">{step}</p>
        </div>
      ))}
    </div>
  );
}

export function CampaignWizard() {
  const steps = ["Purpose", "Context", "Rules", "Targets", "Playbook"];
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<CampaignType>("Prospecting");
  const form = useForm<z.infer<typeof wizardSchema>>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "Q3 finance leader outreach",
      goal: "Book qualified discovery calls with finance leaders.",
      audience: "CFOs and VP Finance at SaaS teams",
    },
  });

  return (
    <div className="space-y-6">
      <Stepper steps={steps} current={step} />
      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>Configure one focused layer at a time. Sending stays manual in this MVP.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <form className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                {campaignTypeOptions.map((option) => (
                  <CampaignTypeCard key={option.title} option={option} active={type === option.title} onClick={() => setType(option.title)} />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Campaign name"><Input {...form.register("name")} /></Field>
                <Field label="Campaign type"><Input value={type} readOnly /></Field>
                <Field label="Main goal"><Input {...form.register("goal")} /></Field>
                <Field label="Target audience"><Input {...form.register("audience")} /></Field>
                <Field label="Channel"><Input defaultValue="Email + LinkedIn" /></Field>
                <Field label="Deadline optional"><Input type="date" /></Field>
              </div>
            </form>
          )}
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Offer / request / job / task description"><Textarea defaultValue="A lightweight campaign cockpit that keeps follow-ups, sources, and next actions together." /></Field>
              <Field label="What do you expect from the target?"><Textarea defaultValue="Reply with interest, send the missing document, or confirm the next owner." /></Field>
              <Field label="What happens if there is no response?"><Textarea defaultValue="Stop after the final reminder unless a manager copy condition applies." /></Field>
              <Field label="Notes"><Textarea defaultValue="Prefer short messages with one ask and one source-backed reason." /></Field>
              <Field label="Tone"><Input defaultValue="Clear, warm, precise" /></Field>
              <Field label="Urgency"><Input defaultValue="Medium" /></Field>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Number of follow-ups", "3"],
                ["Delay between follow-ups", "2 business days, then 4, then 7"],
                ["Stop condition", "Target replies, completes request, or asks to stop"],
                ["Escalation condition", "No response after urgent reminder"],
                ["Manager/CC condition", "Only for HR/request and document collection"],
                ["Final message style", "Respectful close-the-loop"],
              ].map(([label, value]) => (
                <Field key={label} label={label}><Input defaultValue={value} /></Field>
              ))}
              <div className="md:col-span-2 grid gap-3 md:grid-cols-4">
                {["Initial request", "Reminder", "Urgent reminder", "Escalation / manager copy"].map((item) => (
                  <div key={item} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm font-semibold">{item}</div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {["Paste table", "Upload CSV fake UI", "Add manually"].map((mode) => (
                  <button key={mode} className="rounded-lg border border-neutral-200 bg-white p-4 text-left font-semibold shadow-sm hover:bg-neutral-50">{mode}</button>
                ))}
              </div>
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                    <tr>{["Name", "Company", "Role", "Email/link", "Note", "Source link"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
                  </thead>
                  <tbody>
                    {targets.slice(0, 3).map((target) => (
                      <tr key={target.id} className="border-t border-neutral-100">
                        <td className="px-4 py-3">{target.name}</td>
                        <td className="px-4 py-3">{target.company}</td>
                        <td className="px-4 py-3">{target.role}</td>
                        <td className="px-4 py-3">{target.email}</td>
                        <td className="px-4 py-3">{target.note}</td>
                        <td className="px-4 py-3">https://example.com/source</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <AISummaryCard title="AI Playbook preview">
                Generated from your goal, channel, target context, and manual execution rules. Review every card before launch.
              </AISummaryCard>
              <div className="grid gap-4 lg:grid-cols-2">
                {playbookStages.slice(0, 4).map((stage) => <PlaybookStageCard key={stage.id} stage={stage} />)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary"><RefreshCcw className="h-4 w-4" />Regenerate</Button>
                <Button variant="secondary"><FileText className="h-4 w-4" />Edit manually</Button>
                {/* Backend integration point: persist the campaign, targets, and reviewed playbook before launch. */}
                <Button variant="accent"><MailCheck className="h-4 w-4" />Launch campaign</Button>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t border-neutral-100 pt-5">
            <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
            <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>
              {step === steps.length - 1 ? "Ready to launch" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

export function CampaignTabs({ campaignId }: { campaignId: string }) {
  const campaignTargets = getTargetsForCampaign(campaignId);
  const stages = getPlaybook(campaignId);
  const sources = getSourcesForCampaign(campaignId);
  const campaignFollowUps = followUps.filter((item) => item.campaignId === campaignId);

  return (
    <Tabs.Root defaultValue="overview" className="space-y-5">
      <Tabs.List className="flex gap-2 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1">
        {["overview", "targets", "playbook", "follow-ups", "data sources", "activity"].map((tab) => (
          <Tabs.Trigger key={tab} value={tab} className="rounded-md px-3 py-2 text-sm font-semibold capitalize text-neutral-500 data-[state=active]:bg-neutral-950 data-[state=active]:text-white">
            {tab}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="overview" className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <AISummaryCard>
          Prioritize replies, then due follow-ups, then blocked source gaps. Campaign health is strongest when every target has a visible next action.
        </AISummaryCard>
        <Card>
          <CardHeader><CardTitle>Next actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {campaignFollowUps.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 p-3 text-sm">
                <span>{item.target} - {item.step}</span>
                <PriorityBadge priority={item.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      </Tabs.Content>
      <Tabs.Content value="targets"><TargetTable rows={campaignTargets} /></Tabs.Content>
      <Tabs.Content value="playbook" className="grid gap-4 lg:grid-cols-2">{stages.map((stage) => <PlaybookStageCard key={stage.id} stage={stage} />)}</Tabs.Content>
      <Tabs.Content value="follow-ups"><FollowUpQueue rows={campaignFollowUps} /></Tabs.Content>
      <Tabs.Content value="data sources" className="grid gap-4 md:grid-cols-2">{sources.map((source) => <DataSourceCard key={source.id} source={source} />)}</Tabs.Content>
      <Tabs.Content value="activity"><Timeline events={recentTimeline(campaignId)} /></Tabs.Content>
    </Tabs.Root>
  );
}

export function TargetDataDirectory({ targetId }: { targetId: string }) {
  const targetSources = getSourcesForTarget(targetId);
  return targetSources.length ? (
    <div className="grid gap-4 md:grid-cols-2">
      {targetSources.map((source) => <DataSourceCard key={source.id} source={source} />)}
    </div>
  ) : (
    <EmptyState title="No target sources attached" description="Add LinkedIn, email threads, CRM records, Drive folders, documents, invoices, contracts, notes, or custom links." />
  );
}

function recentTimeline(campaignId: string): TimelineEvent[] {
  return recentTimelineEvents.filter((event) => event.campaignId === campaignId);
}

export const recentTimelineEvents: TimelineEvent[] = [
  { id: "rt1", campaignId: "northstar-q3", title: "High-priority reply added", description: "Jon Bell asked for implementation context.", time: "Today 08:42" },
  { id: "rt2", campaignId: "northstar-q3", title: "Follow-up queue refreshed", description: "Nine targets are due today.", time: "Today 07:15" },
  { id: "rt3", campaignId: "design-leads", title: "Playbook review requested", description: "Compensation context is missing from candidate replies.", time: "Yesterday 16:30" },
  { id: "rt4", campaignId: "acme-docs", title: "Security reminder sent", description: "Marcus Lee reminder was marked sent manually.", time: "Yesterday 10:04" },
  { id: "rt5", campaignId: "vendor-renewals", title: "Blocked owners identified", description: "Five vendors need an internal owner before renewal follow-up.", time: "2 days ago" },
];

export function DailyBriefing() {
  return (
    <AISummaryCard title="AI daily briefing">
      <div className="space-y-3">
        {recentUpdates.map((update) => (
          <div key={update} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
            <span>{update}</span>
          </div>
        ))}
      </div>
    </AISummaryCard>
  );
}

export function SourceGroups() {
  const groups = [
    ["Campaign sources", dataSources.filter((source) => !source.targetId)],
    ["Target sources", dataSources.filter((source) => source.targetId && !source.missing)],
    ["Missing sources", dataSources.filter((source) => source.missing)],
    ["Recently used", dataSources.slice(0, 3)],
  ] as const;

  return (
    <Tabs.Root defaultValue={groups[0][0]} className="space-y-5">
      <Tabs.List className="flex flex-wrap gap-2">
        {groups.map(([group]) => (
          <Tabs.Trigger key={group} value={group} className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-500 data-[state=active]:border-neutral-950 data-[state=active]:bg-neutral-950 data-[state=active]:text-white">
            {group}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {groups.map(([group, sources]) => (
        <Tabs.Content key={group} value={group} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sources.map((source) => <DataSourceCard key={source.id} source={source} />)}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="grid min-h-screen bg-[#f7f5f0] lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="flex items-center gap-3 font-semibold text-neutral-950">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-950 text-white"><Sparkles className="h-5 w-5" /></div>
          FollowPilot
        </Link>
        <div className="my-16 max-w-xl">
          <Badge tone="violet">Manual-first campaign AI</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            {mode === "login" ? "Welcome back to your campaign cockpit." : "Create a serious campaign workflow in minutes."}
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Generate playbooks, manage target context, and keep follow-ups visible without automatic sending.
          </p>
        </div>
        <p className="text-sm text-neutral-500">MVP early access - mock workspace</p>
      </div>
      <div className="flex items-center justify-center border-l border-neutral-200 bg-white p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Log in" : "Create account"}</CardTitle>
            <CardDescription>{mode === "login" ? "Continue to FollowPilot." : "Start with a clean mock workspace."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "signup" ? <Field label="Name"><Input placeholder="Maya Chen" /></Field> : null}
            <Field label="Email"><Input type="email" placeholder="maya@company.com" /></Field>
            <Field label="Password"><Input type="password" placeholder="••••••••" /></Field>
            <Button asChild className="w-full" variant="accent">
              <Link href="/app/dashboard">{mode === "login" ? "Log in" : "Create workspace"}</Link>
            </Button>
            <p className="text-center text-sm text-neutral-500">
              {mode === "login" ? "No account yet? " : "Already have an account? "}
              <Link className="font-semibold text-neutral-950" href={mode === "login" ? "/signup" : "/login"}>
                {mode === "login" ? "Sign up" : "Log in"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <Badge tone="violet" className="mb-3">{eyebrow}</Badge> : null}
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-2xl">
      <div className="grid gap-3 md:grid-cols-4">
        {campaigns.slice(0, 4).map((campaign) => (
          <div key={campaign.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <div className="mb-8 flex items-center justify-between">
              <Badge tone="violet">{campaign.type}</Badge>
              <MoreHorizontal className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="font-semibold text-neutral-950">{campaign.name}</p>
            <p className="mt-2 text-sm text-neutral-500">{campaign.followUpsDue} follow-ups due</p>
            <div className="mt-4"><ProgressBar value={campaign.progress} /></div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-neutral-100 p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-neutral-950"><Table2 className="h-4 w-4" />Follow-up queue</div>
          {followUps.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 border-t border-neutral-100 py-3 text-sm">
              <span>{item.target}</span>
              <PriorityBadge priority={item.priority} />
            </div>
          ))}
        </div>
        <AISummaryCard title="AI summary">
          Next best work: handle replies, send high-priority nudges, and add missing source links before copying new messages.
        </AISummaryCard>
      </div>
    </div>
  );
}
