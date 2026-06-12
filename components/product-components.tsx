"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { searchWorkspace } from "@/app/actions/search";
import { addDataSource, deleteDataSource } from "@/app/actions/data-directory";
import { markFollowUpCompleted, snoozeFollowUp } from "@/app/actions/follow-ups";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clipboard,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  FileImage,
  FileSpreadsheet,
  FileText,
  Filter,
  Flag,
  Gauge,
  Home,
  Inbox,
  Layers3,
  LogOut,
  MailCheck,
  MapPinned,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Upload,
  Users,
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
import { Input } from "@/components/ui/input";

const navSections = [
  {
    title: "Today",
    items: [{ label: "Dashboard", href: "/app/dashboard", icon: Home }],
  },
  {
    title: "Workflows",
    items: [
      { label: "Campaigns", href: "/app/campaigns", icon: Layers3 },
      { label: "Create Campaign", href: "/app/campaigns/new", icon: Plus },
      { label: "Follow-ups", href: "/app/follow-ups", icon: CalendarClock },
    ],
  },
  {
    title: "Context",
    items: [{ label: "Data Directory", href: "/app/data-directory", icon: Database }],
  },
  {
    title: "Workspace",
    items: [{ label: "Settings", href: "/app/settings", icon: Settings }],
  },
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

const roleOptions = [
  "CEO",
  "COO",
  "CFO",
  "CTO",
  "CMO",
  "VP Finance",
  "VP Sales",
  "Head of Operations",
  "Head of Revenue",
  "Founder",
  "Managing Director",
  "Operations Manager",
];

const industryOptions = [
  "SaaS",
  "Business Consulting",
  "Accounting",
  "Legal & Compliance",
  "IT Services",
  "Marketing",
  "Healthcare",
  "Retail & E-commerce",
];

const companySizeOptions = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const locationOptions = ["North America", "Europe", "United Kingdom", "France", "United States", "Remote teams"];

const exclusionOptions = [
  "Service providers",
  "Open to Work",
  "Students",
  "Recruiters",
  "Agencies",
  "Competitors",
];

const channelOptions = [
  { name: "LinkedIn", logo: "/logos/linkedin.svg" },
  { name: "Gmail", logo: "/logos/gmail.svg" },
  { name: "Outlook", logo: "/logos/outlook.svg" },
  { name: "Slack", logo: "/logos/slack.svg" },
  { name: "WhatsApp", logo: "/logos/whatsapp.svg" },
  { name: "Teams", logo: "/logos/teams.svg" },
];

const goalOptions = [
  "Prepare manual follow-up queue",
  "Book qualified meetings",
  "Collect missing documents",
  "Move candidates to interview",
  "Confirm owners and approvals",
  "Recover unpaid invoices",
  "Keep important conversations active",
];

const purposeCampaignTypeOptions = campaignTypeOptions.filter((option) => option.title !== "Custom");

const cadenceOptions = [
  { title: "Light", description: "2 touches over 7 days" },
  { title: "Balanced", description: "3 touches over 12 days" },
  { title: "Persistent", description: "4 touches over 21 days" },
];

const toneOptions = [
  { title: "Direct", description: "Short, clear, asks fast" },
  { title: "Warm", description: "Friendly with softer follow-ups" },
  { title: "Executive", description: "Precise and based on saved info" },
];

type CampaignContextPanel = {
  id: string;
  title: string;
  summaryLabel: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  defaultSelected: string[];
  searchPlaceholder?: string;
  customPlaceholder?: string;
};

type CampaignContextProfile = {
  memoryLabel: string;
  previewLabel: string;
  targetSummaryLabel: string;
  panels: CampaignContextPanel[];
};

const campaignContextProfiles: Record<CampaignType, CampaignContextProfile> = {
  Prospecting: {
    memoryLabel: "Target criteria",
    previewLabel: "Target criteria",
    targetSummaryLabel: "Target fit",
    panels: [
      {
        id: "prospectingRoles",
        title: "Job roles",
        summaryLabel: "Roles",
        description: "Select the buyers or decision makers this manual queue should cover.",
        icon: <Users className="h-4 w-4" />,
        options: roleOptions,
        defaultSelected: ["CFO", "VP Finance", "Head of Operations"],
        searchPlaceholder: "Search job titles...",
        customPlaceholder: "Add another role...",
      },
      {
        id: "prospectingIndustries",
        title: "Industries",
        summaryLabel: "Industries",
        description: "Use industry clusters to keep the queue focused.",
        icon: <Building2 className="h-4 w-4" />,
        options: industryOptions,
        defaultSelected: ["SaaS", "Accounting", "IT Services"],
        searchPlaceholder: "Search industries...",
        customPlaceholder: "Add another industry...",
      },
      {
        id: "prospectingSize",
        title: "Company size",
        summaryLabel: "Size",
        description: "Choose the company ranges that should stay in scope.",
        icon: <Building2 className="h-4 w-4" />,
        options: companySizeOptions,
        defaultSelected: ["11-50 employees", "51-200 employees"],
      },
      {
        id: "prospectingLocations",
        title: "Locations",
        summaryLabel: "Locations",
        description: "Regions and countries stay selectable, with free text available.",
        icon: <MapPinned className="h-4 w-4" />,
        options: locationOptions,
        defaultSelected: ["North America", "Europe"],
        customPlaceholder: "Add another location...",
      },
      {
        id: "prospectingExcluded",
        title: "Excluded",
        summaryLabel: "Excluded",
        description: "Keep bad-fit accounts and risky targets out of the queue.",
        icon: <ShieldCheck className="h-4 w-4" />,
        options: exclusionOptions,
        defaultSelected: ["Service providers", "Open to Work"],
        customPlaceholder: "Add a keyword or competitor...",
      },
    ],
  },
  Recruiting: {
    memoryLabel: "Candidate criteria",
    previewLabel: "Candidate fit",
    targetSummaryLabel: "Candidate fit",
    panels: [
      {
        id: "recruitingRoles",
        title: "Roles to hire",
        summaryLabel: "Roles",
        description: "Pick the candidate profiles the follow-up queue should organize.",
        icon: <Users className="h-4 w-4" />,
        options: ["Product Designer", "Frontend Engineer", "Sales Lead", "Operations Manager", "Recruiter", "Customer Success"],
        defaultSelected: ["Product Designer", "Operations Manager"],
        searchPlaceholder: "Search roles...",
        customPlaceholder: "Add another role...",
      },
      {
        id: "recruitingStage",
        title: "Candidate stage",
        summaryLabel: "Stage",
        description: "Track where candidates are stuck before the next manual action.",
        icon: <Flag className="h-4 w-4" />,
        options: ["Sourced", "Contacted", "Replied", "Screen pending", "Interview loop", "Offer"],
        defaultSelected: ["Contacted", "Screen pending"],
      },
      {
        id: "recruitingSignals",
        title: "Useful signals",
        summaryLabel: "Signals",
        description: "Choose what the AI should look for in notes, links and candidate info.",
        icon: <FileText className="h-4 w-4" />,
        options: ["Portfolio link", "Relevant company", "Seniority match", "Location match", "Compensation question", "Hiring manager note"],
        defaultSelected: ["Portfolio link", "Seniority match"],
      },
      {
        id: "recruitingLocations",
        title: "Locations",
        summaryLabel: "Locations",
        description: "Where candidates can be based for this workflow.",
        icon: <MapPinned className="h-4 w-4" />,
        options: locationOptions,
        defaultSelected: ["Europe", "Remote teams"],
        customPlaceholder: "Add another location...",
      },
    ],
  },
  "HR request": {
    memoryLabel: "Internal request scope",
    previewLabel: "Request scope",
    targetSummaryLabel: "Request scope",
    panels: [
      {
        id: "hrTeams",
        title: "Teams involved",
        summaryLabel: "Teams",
        description: "Select the internal groups that may own or receive follow-ups.",
        icon: <Users className="h-4 w-4" />,
        options: ["People Ops", "Managers", "Finance", "Legal", "IT", "Payroll"],
        defaultSelected: ["People Ops", "Managers"],
        customPlaceholder: "Add another team...",
      },
      {
        id: "hrRequests",
        title: "Request types",
        summaryLabel: "Requests",
        description: "Keep the queue organized around the actual internal work.",
        icon: <FileText className="h-4 w-4" />,
        options: ["Onboarding task", "Policy acknowledgement", "Contract update", "Equipment request", "Manager approval", "Missing employee info"],
        defaultSelected: ["Onboarding task", "Manager approval"],
      },
      {
        id: "hrPriority",
        title: "Priority markers",
        summaryLabel: "Priority",
        description: "Choose what makes a request urgent or blocked.",
        icon: <ShieldCheck className="h-4 w-4" />,
        options: ["Start date near", "Payroll blocked", "Legal review needed", "Manager missing", "Employee waiting"],
        defaultSelected: ["Start date near", "Manager missing"],
      },
    ],
  },
  "Client documents": {
    memoryLabel: "Document collection",
    previewLabel: "Document checklist",
    targetSummaryLabel: "Documents",
    panels: [
      {
        id: "documentContacts",
        title: "Responsible contacts",
        summaryLabel: "Contacts",
        description: "Select who may own the missing documents or approvals.",
        icon: <Users className="h-4 w-4" />,
        options: ["Client sponsor", "Security lead", "Finance contact", "Legal contact", "Project owner", "Operations contact"],
        defaultSelected: ["Client sponsor", "Security lead", "Finance contact"],
        customPlaceholder: "Add another owner...",
      },
      {
        id: "documentTypes",
        title: "Documents needed",
        summaryLabel: "Documents",
        description: "Pick the actual documents the campaign should collect.",
        icon: <FileText className="h-4 w-4" />,
        options: ["Signed contract", "SOC2 confirmation", "Billing details", "Vendor form", "Security questionnaire", "Purchase order", "Tax form"],
        defaultSelected: ["Signed contract", "SOC2 confirmation", "Billing details"],
        searchPlaceholder: "Search documents...",
        customPlaceholder: "Add another document...",
      },
      {
        id: "documentStatus",
        title: "Document status",
        summaryLabel: "Status",
        description: "Track what is missing, pending, or ready to verify.",
        icon: <Flag className="h-4 w-4" />,
        options: ["Missing", "Requested", "Received but unchecked", "Needs signature", "Needs sponsor", "Blocked by owner"],
        defaultSelected: ["Missing", "Needs signature", "Blocked by owner"],
      },
      {
        id: "documentSources",
        title: "Storage locations",
        summaryLabel: "Storage",
        description: "Choose where documents, folders and links should be attached.",
        icon: <Database className="h-4 w-4" />,
        options: ["Drive folder", "Email thread", "CRM note", "Contract workspace", "Security portal", "Custom link"],
        defaultSelected: ["Drive folder", "Email thread"],
        customPlaceholder: "Add another location...",
      },
    ],
  },
  "Invoice follow-up": {
    memoryLabel: "Invoice collection",
    previewLabel: "Invoice state",
    targetSummaryLabel: "Invoice state",
    panels: [
      {
        id: "invoiceContacts",
        title: "Payment contacts",
        summaryLabel: "Contacts",
        description: "Select the people or teams who can unblock payment.",
        icon: <Users className="h-4 w-4" />,
        options: ["AP contact", "Finance manager", "Client sponsor", "Procurement", "Legal", "Project owner"],
        defaultSelected: ["AP contact", "Finance manager", "Client sponsor"],
        customPlaceholder: "Add another contact type...",
      },
      {
        id: "invoiceStatus",
        title: "Invoice status",
        summaryLabel: "Status",
        description: "Keep follow-ups tied to the real billing state.",
        icon: <FileText className="h-4 w-4" />,
        options: ["Sent", "Overdue", "PO missing", "Disputed", "Approved not paid", "Partial payment", "Payment promised"],
        defaultSelected: ["Overdue", "PO missing", "Approved not paid"],
      },
      {
        id: "invoiceProof",
        title: "Proof to attach",
        summaryLabel: "Proof",
        description: "Select the evidence the user should keep near each message.",
        icon: <Database className="h-4 w-4" />,
        options: ["Invoice PDF", "PO number", "Contract", "Email approval", "Payment terms", "Statement of work"],
        defaultSelected: ["Invoice PDF", "PO number", "Payment terms"],
      },
    ],
  },
  "Vendor follow-up": {
    memoryLabel: "Vendor coordination",
    previewLabel: "Vendor state",
    targetSummaryLabel: "Vendor state",
    panels: [
      {
        id: "vendorOwners",
        title: "Owners involved",
        summaryLabel: "Owners",
        description: "Select who must confirm renewal, terms, or next action.",
        icon: <Users className="h-4 w-4" />,
        options: ["Vendor contact", "Internal owner", "Finance", "Legal", "Procurement", "Security"],
        defaultSelected: ["Vendor contact", "Internal owner", "Procurement"],
        customPlaceholder: "Add another owner...",
      },
      {
        id: "vendorItems",
        title: "Items to confirm",
        summaryLabel: "Items",
        description: "Pick the vendor details this workspace should keep visible.",
        icon: <FileText className="h-4 w-4" />,
        options: ["Renewal terms", "Missing invoice", "Contract dates", "Security review", "Owner approval", "Cancellation window"],
        defaultSelected: ["Renewal terms", "Owner approval", "Contract dates"],
      },
      {
        id: "vendorRisks",
        title: "Risk markers",
        summaryLabel: "Risks",
        description: "Choose the conditions that should make a vendor follow-up urgent.",
        icon: <ShieldCheck className="h-4 w-4" />,
        options: ["Renewal date near", "Owner unknown", "Legal review needed", "Invoice missing", "Security blocked"],
        defaultSelected: ["Renewal date near", "Owner unknown"],
      },
    ],
  },
  Custom: {
    memoryLabel: "Workflow context",
    previewLabel: "Workflow context",
    targetSummaryLabel: "Context",
    panels: [
      {
        id: "customPeople",
        title: "People involved",
        summaryLabel: "People",
        description: "Select the people or groups this follow-up workspace should track.",
        icon: <Users className="h-4 w-4" />,
        options: ["External contact", "Internal owner", "Approver", "Requester", "Manager", "Finance"],
        defaultSelected: ["External contact", "Internal owner"],
        customPlaceholder: "Add another person type...",
      },
      {
        id: "customWork",
        title: "Work to move forward",
        summaryLabel: "Work",
        description: "Define the concrete thing the queue should help complete.",
        icon: <FileText className="h-4 w-4" />,
        options: ["Reply needed", "Approval needed", "Document needed", "Meeting needed", "Decision needed", "Owner needed"],
        defaultSelected: ["Reply needed", "Owner needed"],
        customPlaceholder: "Add another item...",
      },
      {
        id: "customSignals",
        title: "Blocked signals",
        summaryLabel: "Blocked",
        description: "Choose what should make an item blocked or ready for review.",
        icon: <ShieldCheck className="h-4 w-4" />,
        options: ["No owner", "No document", "No reply", "Deadline near", "Needs review", "Waiting on third party"],
        defaultSelected: ["No owner", "Deadline near"],
      },
    ],
  },
};

const defaultContextSelections = Object.fromEntries(
  Object.values(campaignContextProfiles).flatMap((profile) =>
    profile.panels.map((panel) => [panel.id, panel.defaultSelected]),
  ),
) as Record<string, string[]>;

const stopConditionOptionsByType: Record<CampaignType, string[]> = {
  Prospecting: ["Target replies", "Target asks to stop", "Saved info is missing", "Manager review needed"],
  Recruiting: ["Candidate replies", "Candidate declines", "Screen booked", "Hiring manager review needed"],
  "HR request": ["Request completed", "Manager approved", "Employee blocked", "Policy owner review needed"],
  "Client documents": ["All documents received", "Sponsor confirms owner", "Document is rejected", "Security/legal review needed"],
  "Invoice follow-up": ["Payment received", "Payment date promised", "Invoice disputed", "Finance review needed"],
  "Vendor follow-up": ["Owner confirms", "Renewal resolved", "Vendor replies", "Legal/procurement review needed"],
  Custom: ["Target replies", "Task completed", "Owner assigned", "Review needed"],
};

const defaultStopRulesByType: Record<CampaignType, string[]> = {
  Prospecting: ["Target replies", "Target asks to stop"],
  Recruiting: ["Candidate replies", "Screen booked"],
  "HR request": ["Request completed", "Manager approved"],
  "Client documents": ["All documents received", "Sponsor confirms owner"],
  "Invoice follow-up": ["Payment received", "Payment date promised"],
  "Vendor follow-up": ["Owner confirms", "Renewal resolved"],
  Custom: ["Task completed", "Owner assigned"],
};

const workflowStepsByType: Record<CampaignType, string[]> = {
  Prospecting: ["Initial note", "Follow-up", "Value reminder", "Close the loop"],
  Recruiting: ["Candidate intro", "Role context", "Scheduling reminder", "Close or nurture"],
  "HR request": ["Internal request", "Reminder", "Manager nudge", "Escalation note"],
  "Client documents": ["Document request", "Checklist reminder", "Owner escalation", "Close when received"],
  "Invoice follow-up": ["Payment check", "Invoice reminder", "Proof attached", "Finance escalation"],
  "Vendor follow-up": ["Owner check", "Vendor reminder", "Approval nudge", "Renewal close"],
  Custom: ["Initial ask", "Reminder", "Review nudge", "Close the loop"],
};

const targetTableConfigByType: Record<CampaignType, { modes: string[]; headers: string[]; getRow: (target: TargetRecord) => string[] }> = {
  Prospecting: {
    modes: ["Paste target table", "Upload CSV", "Add one target"],
    headers: ["Name", "Company", "Role", "Email/link", "Note", "Useful link"],
    getRow: (target) => [target.name, target.company, target.role, target.email, target.note, "Company page / profile"],
  },
  Recruiting: {
    modes: ["Paste candidate list", "Upload CSV", "Add candidate"],
    headers: ["Candidate", "Current company", "Role", "Email/link", "Signal", "Useful link"],
    getRow: (target) => [target.name, target.company, target.role, target.email, target.note, "Portfolio / profile"],
  },
  "HR request": {
    modes: ["Paste internal list", "Upload CSV", "Add employee/request"],
    headers: ["Person", "Team", "Request owner", "Email/link", "Request", "Useful link"],
    getRow: (target) => [target.name, target.company, target.role, target.email, target.note, "HR note"],
  },
  "Client documents": {
    modes: ["Paste contact list", "Upload CSV", "Add document owner"],
    headers: ["Contact", "Client", "Owns", "Email/link", "Missing document", "Folder"],
    getRow: (target) => [target.name, target.company, target.role, target.email, "Signed form / SOC2 confirmation", "Drive folder"],
  },
  "Invoice follow-up": {
    modes: ["Paste invoice contacts", "Upload CSV", "Add payer"],
    headers: ["Contact", "Account", "Payment role", "Email/link", "Invoice status", "Proof link"],
    getRow: (target) => [target.name, target.company, target.role, target.email, "Overdue / PO missing", "Invoice PDF"],
  },
  "Vendor follow-up": {
    modes: ["Paste vendor list", "Upload CSV", "Add vendor"],
    headers: ["Vendor contact", "Vendor", "Owner", "Email/link", "Item to confirm", "Useful link"],
    getRow: (target) => [target.name, target.company, target.role, target.email, "Renewal terms", "Contract link"],
  },
  Custom: {
    modes: ["Paste table", "Upload CSV", "Add item"],
    headers: ["Person", "Organization", "Role", "Email/link", "Needed action", "Useful link"],
    getRow: (target) => [target.name, target.company, target.role, target.email, target.note, "Useful link"],
  },
};

function toggleChoice(list: string[], item: string) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

type NotificationType = { id: string | number; title: string; target: string; campaign: string; time: string };

export function AppSidebar({ 
  user, 
  initialNotifications = [] 
}: { 
  user?: { name?: string; email?: string; initials?: string },
  initialNotifications?: NotificationType[]
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationType[]>(initialNotifications);

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      await supabase.auth.signOut();
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className={cn(
      "sticky top-0 z-20 hidden h-screen overflow-y-auto border-r border-white/15 bg-[radial-gradient(circle_at_30%_0%,rgba(216,180,254,0.38),transparent_34%),linear-gradient(180deg,#7c3aed_0%,#5b21b6_54%,#3b168f_100%)] px-4 py-5 text-white shadow-2xl shadow-violet-950/20 transition-all duration-300 lg:block shrink-0",
      collapsed ? "w-24" : "w-72",
    )}>
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative flex min-h-[calc(100vh-2.5rem)] flex-col">
      <div className={cn("mb-8 flex items-center gap-3", collapsed ? "justify-center px-0" : "justify-between px-2")}>
        <Link href="/app/dashboard" className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white shadow-lg shadow-violet-950/20">
          <VerytisLogo className="h-7 w-7" />
        </div>
        <div className={cn("min-w-0", collapsed && "hidden")}>
          <p className="text-sm font-bold text-white">verytis</p>
          <p className="text-xs text-white/60">Follow-up cockpit</p>
        </div>
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
          className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 text-white/80 transition hover:bg-white/20 hover:text-white", collapsed && "absolute -right-9 top-0 bg-violet-700 shadow-lg shadow-violet-950/20")}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className={cn("mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45", collapsed && "sr-only")}>
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition",
                        active && "bg-white text-violet-800 shadow-lg shadow-violet-950/15",
                        !active && "hover:bg-white/12 hover:text-white",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span className={cn(collapsed && "sr-only")}>{item.label}</span>
                    </Link>
                    {item.href === "/app/dashboard" ? <SidebarSearchItem collapsed={collapsed} /> : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto space-y-3 pt-8 relative">
        <Link
          href="/app/campaigns/new"
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-violet-800 shadow-xl shadow-violet-950/20 transition hover:bg-violet-50",
            collapsed && "hidden"
          )}
        >
          <Plus className="h-4 w-4" />
          Create campaign
        </Link>

        {notificationsOpen && !collapsed && (
          <div className="absolute bottom-[calc(100%+0.5rem)] left-0 w-full rounded-2xl border border-violet-500/15 bg-white p-3 shadow-2xl shadow-violet-950/30 z-50 text-[#120b2f]">
            <div className="mb-2 px-1 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Notifications</span>
              <button onClick={() => setNotificationsOpen(false)} className="text-neutral-400 hover:text-neutral-900"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              <SubscriptionExpiredNotification />
              {notifications.length === 0 ? (
                <p className="py-3 text-center text-sm text-[#120b2f]/50">No pending follow-ups.</p>
              ) : (
                notifications.map((notif) => (
                  <button 
                    key={notif.id} 
                    onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))}
                    className="block w-full text-left rounded-xl border border-violet-100 bg-violet-50/50 p-2.5 text-sm transition hover:bg-violet-100"
                  >
                    <p className="font-semibold text-rose-600 text-xs">{notif.title}</p>
                    <p className="mt-0.5 font-medium">{notif.target}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-[#120b2f]/50">
                      <span>{notif.campaign}</span>
                      <span>{notif.time}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className={cn("flex items-center gap-2 rounded-2xl border border-white/15 bg-white/12 p-2 shadow-xl shadow-violet-950/10", collapsed && "flex-col justify-center border-transparent bg-transparent p-0 shadow-none")}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/14 text-white transition hover:bg-white/22"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-400 ring-2 ring-violet-800" />}
          </button>
          <Link
            href="/app/settings"
            className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/12", collapsed && "flex-none justify-center px-0")}
            title="Profile"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-violet-800 shadow-lg shadow-violet-950/15 uppercase">
              {user?.initials || "VV"}
            </span>
            <span className={cn("min-w-0", collapsed && "sr-only")}>
              <span className="block truncate text-sm font-semibold text-white">{user?.name || "Verytis User"}</span>
              <span className="block truncate text-xs text-white/55">Account settings</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/14 text-white transition hover:bg-white/22", collapsed && "mt-2")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
    </aside>
  );
}

function SubscriptionExpiredNotification() {
  const [isExpired, setIsExpired] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Try to get subscription status from auth context
    try {
      const authProvider = document.querySelector("[data-auth-expired]");
      if (authProvider?.getAttribute("data-auth-expired") === "true") {
        setIsExpired(true);
      }
    } catch {
      // Fallback: check via API if session is available
    }
  }, []);

  // Listen for custom event from auth provider
  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setIsExpired(detail?.isExpired === true);
    };
    window.addEventListener("subscription-status", handler);
    return () => window.removeEventListener("subscription-status", handler);
  }, []);

  if (!isExpired) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="font-bold text-amber-800 text-xs">⚠️ Subscription expired</p>
      <p className="mt-1 text-xs text-amber-700/70">Your free trial has ended.</p>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Subscribe — $19.99/mo"}
      </button>
    </div>
  );
}

function VerytisLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M62 394C92 292 184 236 270 193C350 153 402 102 432 42C442 124 412 205 348 253C308 283 263 302 217 318C274 320 331 306 383 271C355 335 301 376 226 386C153 396 96 398 62 466"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M220 319C286 304 345 266 392 207C382 270 348 318 293 350C242 379 184 393 119 390"
        stroke="currentColor"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarSearchItem({ collapsed }: { collapsed: boolean }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const normalizedQuery = query.trim().toLowerCase();

  React.useEffect(() => {
    if (!normalizedQuery) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const data = await searchWorkspace(normalizedQuery);
      setResults(data);
    });
  }, [normalizedQuery]);

  const filteredRows = normalizedQuery ? results : [];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/12 hover:text-white",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Search" : undefined}
        >
          <Search className="h-4 w-4" />
          <span className={cn(collapsed && "sr-only")}>Search</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-violet-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[18%] z-50 w-[min(92vw,680px)] -translate-x-1/2 overflow-hidden rounded-[1.5rem] border border-violet-500/20 bg-white shadow-2xl shadow-violet-950/30">
          <div className="flex items-center gap-3 border-b border-violet-100 bg-violet-50/70 px-5 py-4">
            <Search className="h-5 w-5 text-violet-600" />
            <Dialog.Title className="sr-only">Search workspace</Dialog.Title>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaigns, targets, follow-ups..."
              className="h-10 flex-1 bg-transparent text-base font-medium text-[#120b2f] outline-none placeholder:text-violet-900/35"
            />
            <Dialog.Close className="grid h-9 w-9 place-items-center rounded-xl text-violet-900/55 transition hover:bg-white hover:text-violet-900" aria-label="Close search">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="p-3">
            <Link
              href="/app/campaigns/new"
              className="mb-3 flex items-center gap-3 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              New campaign
            </Link>
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-violet-900/45">
              {normalizedQuery ? "Results" : "Recent workspace"}
            </p>
            <div className="space-y-1">
              {filteredRows.map((row) => (
                <Link key={row.id} href={row.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-violet-50">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
                    <Search className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#120b2f]">{row.title}</span>
                    <span className="block truncate text-xs text-[#120b2f]/55">{row.detail}</span>
                  </span>
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">{row.type}</span>
                </Link>
              ))}
              {filteredRows.length === 0 ? (
                <div className="rounded-2xl bg-violet-50 px-4 py-8 text-center text-sm font-medium text-violet-900/60">
                  No result found.
                </div>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
    <Card className="transition hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(46,16,101,0.18)]">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            <p className={cn("mt-2 text-3xl font-bold tracking-tight", tone)}>{value}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
      <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

const campaignFilterGroups = [
  {
    title: "Action",
    filters: ["All", "Needs action"],
  },
  {
    title: "Status",
    filters: ["Active", "Waiting", "Blocked", "Review", "Completed"],
  },
  {
    title: "Category",
    filters: ["Prospecting", "Recruiting", "HR request", "Client documents", "Invoice follow-up", "Vendor follow-up"],
  },
];

function campaignMatchesFilter(campaign: Campaign, filter: string) {
  if (filter === "All") return true;
  if (filter === "Needs action") return campaign.followUpsDue > 0 || campaign.blocked > 0 || campaign.status === "Review";
  if (filter === "Documents") return campaign.type === "Client documents";
  if (filter === "Invoice") return campaign.type === "Invoice follow-up";
  return campaign.status === filter || campaign.type === filter;
}

function campaignChannelValues(channel: string) {
  return channel
    .split("+")
    .map((item) => item.trim())
    .map((item) => (item === "Email" ? "Gmail" : item))
    .filter(Boolean);
}

function followUpQueueScore(item: FollowUp) {
  const reason = `${item.reason} ${item.step}`.toLowerCase();
  const replyScore = reason.includes("reply") ? 0 : 10;
  const priorityScore = item.priority === "High" ? 0 : item.priority === "Medium" ? 2 : 4;
  const dueScore = item.dueDate.toLowerCase().includes("today") ? 0 : item.dueDate.toLowerCase().includes("tomorrow") ? 2 : 4;
  const blockerScore = reason.includes("document") || reason.includes("info") || reason.includes("missing") ? 1 : 0;

  return replyScore + priorityScore + dueScore + blockerScore;
}

function stageMatchesCurrentStep(stage: PlaybookStage, currentStep: string) {
  const stageTitle = stage.title.toLowerCase();
  const step = currentStep.toLowerCase();

  return step.includes(stageTitle) || stageTitle.includes(step) || (step.includes("follow-up") && stageTitle.includes(step.replace("follow-up", "follow-up ")));
}

export function CampaignDirectory({ rows = campaigns }: { rows?: Campaign[] }) {
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const filteredRows = rows.filter((campaign) => campaignMatchesFilter(campaign, activeFilter));
  const needsActionCount = rows.filter((campaign) => campaignMatchesFilter(campaign, "Needs action")).length;
  const activeCount = rows.filter((campaign) => campaign.status === "Active" || campaign.status === "Review").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-violet-500/10 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-violet-500/15 bg-white px-3 text-sm font-semibold text-violet-950/70 shadow-sm transition hover:bg-violet-50 hover:text-violet-950"
            >
              <Filter className="h-4 w-4 text-violet-700" />
              Filters
              <ChevronRight className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-90")} />
            </button>
            <Badge tone="violet" className="rounded-md px-3 py-2">
              {activeFilter}
            </Badge>
            {activeFilter !== "All" ? (
              <button
                type="button"
                onClick={() => setActiveFilter("All")}
                className="h-9 rounded-md px-2 text-sm font-semibold text-neutral-400 transition hover:bg-violet-50 hover:text-violet-700"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="violet" className="rounded-md px-3 py-2">
              <Users className="h-3.5 w-3.5" />
              {activeCount} running
            </Badge>
            <Badge tone={needsActionCount ? "amber" : "emerald"} className="rounded-md px-3 py-2">
              {needsActionCount} need action
            </Badge>
          </div>
        </div>
        {filtersOpen ? (
          <CampaignFilterPanel active={activeFilter} onChange={setActiveFilter} rows={rows} />
        ) : null}
      </div>
      <div className="grid w-full gap-4 lg:grid-cols-2">
        {filteredRows.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
      </div>
      {filteredRows.length === 0 ? (
        <EmptyState title="No campaigns match this filter" description="Switch filters or create a manual follow-up workspace." />
      ) : null}
    </div>
  );
}

function CampaignFilterPanel({
  active,
  onChange,
  rows,
}: {
  active: string;
  onChange: (filter: string) => void;
  rows: Campaign[];
}) {
  return (
    <div className="rounded-lg border border-violet-500/15 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-3">
        {campaignFilterGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">{group.title}</p>
            <div className="flex flex-wrap gap-2">
              {group.filters.map((filter) => {
                const count = rows.filter((campaign) => campaignMatchesFilter(campaign, filter)).length;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => onChange(filter)}
                    className={cn(
                      "inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs font-semibold transition",
                      active === filter
                        ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                        : "border-violet-500/15 bg-white text-violet-950/60 hover:bg-violet-50 hover:text-violet-950",
                    )}
                  >
                    {filter}
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", active === filter ? "bg-white/18 text-white" : "bg-violet-50 text-violet-700")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const channelValues = campaignChannelValues(campaign.channel);
  const metrics = [
    ["Due", campaign.followUpsDue, "manual actions"],
    ["Replies", campaign.replies, "to review"],
    ["Blocked", campaign.blocked, "need docs/info"],
    ["Done", campaign.completed, "completed"],
  ] as const;

  return (
    <article className="overflow-hidden rounded-lg border border-violet-500/15 bg-white shadow-sm transition hover:border-violet-500/25 hover:shadow-xl hover:shadow-violet-950/8">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/app/campaigns/${campaign.id}`} className="font-semibold text-neutral-950 hover:text-violet-700">
                {campaign.name}
              </Link>
              <Badge tone="violet" className="rounded-md">{campaign.type}</Badge>
            </div>
            <p className="mt-2 line-clamp-1 max-w-2xl text-sm text-neutral-500">{campaign.goal}</p>
          </div>
          <div className="flex items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            <button type="button" aria-label="Campaign actions" className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 transition hover:bg-violet-50 hover:text-violet-700">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {metrics.map(([label, value, detail]) => (
            <div key={label}>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
              <p className="mt-1 text-2xl font-semibold leading-none text-neutral-950">{value}</p>
              <p className="mt-1 text-xs text-neutral-400">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <ProgressBar value={campaign.progress} />
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
            <span>{campaign.progress}% complete</span>
            <span>{campaign.targets} targets</span>
          </div>
        </div>

        <div className="-mx-5 -mb-5 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-violet-500/10 bg-violet-50/35 px-5 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ChannelLogoPill channels={channelValues} />
            <span className="truncate text-sm text-neutral-500">{campaign.owner}</span>
            <span className="text-sm text-neutral-300">·</span>
            <span className="text-sm text-neutral-500">Updated {campaign.lastActivity}</span>
            <span className="text-sm text-neutral-300">·</span>
            <span className="text-sm text-neutral-500">Due {campaign.deadline}</span>
          </div>
          <Button asChild size="sm" variant="accent" className="rounded-md">
            <Link href={`/app/campaigns/${campaign.id}`}>
              Open
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CampaignTypeCard({ option, active, onClick }: { option: (typeof campaignTypeOptions)[number]; active?: boolean; onClick?: () => void }) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full flex-col items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-lg shadow-violet-950/5 transition hover:-translate-y-0.5",
        active ? "border-violet-400 ring-2 ring-violet-100" : "border-violet-500/15",
      )}
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
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
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-violet-500/15 bg-white/95 p-2 shadow-xl shadow-violet-950/5">
      <Badge tone="violet" className="rounded-xl">
        <Filter className="h-3.5 w-3.5" />
        Filters
      </Badge>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActive(filter)}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm font-medium transition",
            active === filter ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "border-violet-500/15 bg-white text-violet-950/65 hover:bg-violet-50 hover:text-violet-950",
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
    <div className="overflow-hidden rounded-2xl border border-violet-500/15 bg-white shadow-2xl shadow-violet-950/8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-violet-50 text-xs uppercase tracking-wide text-violet-900/55">
            <tr>
              {["Campaign name", "Type", "Goal", "Status", "Targets", "Progress", "Due", "Last activity", "Owner"].map((head) => (
                <th className="px-4 py-3 font-semibold" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100">
            {rows.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-violet-50/50">
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
    <div className="overflow-hidden rounded-2xl border border-violet-500/15 bg-white shadow-2xl shadow-violet-950/8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-violet-50 text-xs uppercase tracking-wide text-violet-900/55">
            <tr>
              {["Target", "Status", "Current step", "Priority", "Last action", "Next action", "Due", "Docs/info", "Actions"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100">
            {rows.map((target) => (
              <tr key={target.id} className="hover:bg-violet-50/50">
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
    <Card className="border-white/25 bg-gradient-to-br from-white via-white to-violet-50/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
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

export function TargetSequence({ stages, currentStep }: { stages: PlaybookStage[]; currentStep: string }) {
  const matchedIndex = stages.findIndex((stage) => stageMatchesCurrentStep(stage, currentStep));
  const activeIndex = matchedIndex >= 0 ? matchedIndex : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Follow-up sequence</CardTitle>
            <CardDescription>The current prospect position inside the reviewed campaign playbook.</CardDescription>
          </div>
          <Badge tone="violet">{currentStep}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;

          return (
            <div
              key={stage.id}
              className={cn(
                "grid gap-3 rounded-2xl border p-4 transition md:grid-cols-[auto_1fr]",
                active && "border-violet-500 bg-violet-50 shadow-lg shadow-violet-950/8",
                completed && "border-emerald-200 bg-emerald-50/70",
                !active && !completed && "border-violet-500/10 bg-white",
              )}
            >
              <div className={cn(
                "grid h-9 w-9 place-items-center rounded-full text-sm font-bold",
                active && "bg-violet-600 text-white",
                completed && "bg-emerald-600 text-white",
                !active && !completed && "bg-violet-50 text-violet-700",
              )}>
                {completed ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-neutral-950">{stage.title}</p>
                  <Badge tone={active ? "violet" : completed ? "emerald" : "neutral"}>{active ? "Current" : completed ? "Done" : stage.delay}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{stage.condition}</p>
                {active ? (
                  <p className="mt-3 rounded-xl border border-violet-500/10 bg-white p-3 text-sm leading-6 text-neutral-700">{stage.message}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ConversationContext({ target, events }: { target: TargetRecord; events: TimelineEvent[] }) {
  const initialMessages = [
    {
      id: "last-action",
      speaker: "you",
      author: "You",
      text: target.lastAction,
      time: "Earlier",
    },
    {
      id: "what-happened",
      speaker: "prospect",
      author: target.name,
      text: target.summary.happened,
      time: "Latest",
    },
    ...events.map((event) => ({
      id: event.id,
      speaker: "you",
      author: "You",
      text: event.description,
      time: event.time,
    })),
  ];
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");
  const [speaker, setSpeaker] = React.useState<"you" | "prospect">("you");
  const [messageTime, setMessageTime] = React.useState("09:00");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-violet-100 bg-violet-50/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Rebuild the actual exchange with sender, message, and time.</CardDescription>
          </div>
          <Badge tone="violet">{messages.length} messages</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => {
            const userLike = message.speaker === "you";

            return (
              <div key={message.id} className={cn("flex", userLike ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl border px-4 py-3 text-sm shadow-sm",
                    userLike
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-violet-500/15 bg-white text-neutral-700",
                  )}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                    <span>{message.author}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="leading-6">{message.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-2xl border border-violet-500/15 bg-violet-50/60 p-3">
          <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex rounded-xl border border-violet-500/15 bg-white p-1">
              {[
                ["you", "You"],
                ["prospect", target.name],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSpeaker(value as "you" | "prospect")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    speaker === value ? "bg-violet-600 text-white shadow-sm" : "text-neutral-500 hover:bg-violet-50 hover:text-violet-900",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-violet-500/15 bg-white px-3 py-2 text-sm font-semibold text-neutral-600">
              <Clock3 className="h-4 w-4 text-violet-700" />
              <input
                type="time"
                value={messageTime}
                onChange={(event) => setMessageTime(event.target.value)}
                className="bg-transparent text-neutral-950 outline-none"
              />
            </label>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={speaker === "you" ? "Write the message you sent..." : `Write what ${target.name} replied...`}
            className="min-h-24 w-full resize-none rounded-xl border border-violet-500/15 bg-white px-3 py-2 text-sm leading-6 text-neutral-950 shadow-sm outline-none placeholder:text-neutral-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-neutral-500">This transcript becomes the context for the next follow-up draft.</p>
            <Button
              type="button"
              size="sm"
              variant="accent"
              onClick={() => {
                const value = draft.trim();
                if (!value) return;
                setMessages((current) => [
                  ...current,
                  {
                    id: `conversation-${Date.now()}`,
                    speaker,
                    author: speaker === "you" ? "You" : target.name,
                    text: value,
                    time: messageTime,
                  },
                ]);
                setDraft("");
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Add message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FollowUpQueue({ rows = followUps }: { rows?: FollowUp[] }) {
  return (
    <div className="space-y-3">
      {rows.map((followUp) => (
        <Card key={followUp.id} className="transition hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(46,16,101,0.16)]">
          <CardContent className="grid gap-4 pt-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={followUp.priority} />
                <Badge>{followUp.dueDate}</Badge>
                <Badge tone="violet">{followUp.step}</Badge>
              </div>
              <p className="font-semibold text-neutral-950">{followUp.target}</p>
              <p className="text-sm text-neutral-500">{followUp.campaign} - {followUp.reason}</p>
              <p className="mt-3 rounded-xl border border-violet-500/10 bg-violet-50/70 p-3 text-sm leading-6 text-neutral-700">{followUp.message}</p>
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

type FollowUpType = {
  id: string;
  campaignId: string;
  targetId: string;
  target: string;
  campaign: string;
  type: string;
  reason: string;
  priority: any;
  status: string;
  due: string;
  dueDate: string;
  missingContext: boolean;
  messagePreview: string;
  message: string;
  step: string;
};
type FollowUpCampaignType = { id: string; name: string; status: string; type: string; goal: string; channel: string; followUpsDue: number };
type FollowUpTargetType = { id: string; campaignId: string; name: string; company: string; role: string; email: string; status: string; priority: string; nextAction: string };

export function FollowUpCampaignQueue({ 
  initialFollowUps = [],
  initialCampaigns = [],
  initialTargets = []
}: { 
  initialFollowUps?: FollowUpType[];
  initialCampaigns?: FollowUpCampaignType[];
  initialTargets?: FollowUpTargetType[];
}) {
  const [items, setItems] = React.useState<FollowUpType[]>(initialFollowUps);
  const firstCampaignWithQueue = initialCampaigns.find((campaign) => initialFollowUps.some((item) => item.campaignId === campaign.id)) ?? initialCampaigns[0];
  const [selectedCampaignId, setSelectedCampaignId] = React.useState(firstCampaignWithQueue?.id ?? "");
  const selectedCampaign = initialCampaigns.find((campaign) => campaign.id === selectedCampaignId) ?? firstCampaignWithQueue;
  
  if (!selectedCampaign) {
    return <div className="p-8 text-center text-neutral-500">No campaigns or follow-ups available.</div>;
  }

  const campaignFollowUps = [...items.filter((item) => item.campaignId === selectedCampaign.id)]
    .sort((a, b) => followUpQueueScore(a) - followUpQueueScore(b));
  const campaignTargets = initialTargets.filter((target) => target.campaignId === selectedCampaign.id);
  const nextItem = campaignFollowUps[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Campaign selector</CardTitle>
            <CardDescription>Choose the workspace before reading its manual queue.</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCampaignId}
              onChange={(event) => setSelectedCampaignId(event.target.value)}
              className="h-11 w-full rounded-md border border-violet-500/15 bg-white px-3 text-sm font-semibold text-neutral-950 shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {initialCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
            <div className="mt-4 flex flex-wrap gap-2">
              <CampaignStatusBadge status={selectedCampaign.status as any} />
              <Badge tone="violet">{selectedCampaign.type}</Badge>
              <Badge>{selectedCampaign.followUpsDue} due</Badge>
              <ChannelLogoPill channels={campaignChannelValues(selectedCampaign.channel)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-violet-100 bg-violet-50/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{selectedCampaign.name}</CardTitle>
              <CardDescription>{selectedCampaign.goal}</CardDescription>
            </div>
            <Badge tone="violet" className="rounded-xl">{campaignFollowUps.length} open</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {nextItem ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800/70">Next best action</p>
              <p className="mt-2 font-semibold text-neutral-950">{nextItem.target}</p>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{nextItem.reason}</p>
            </div>
          ) : null}

          {campaignFollowUps.map((item) => {
            const target = initialTargets.find((targetItem) => targetItem.id === item.targetId);
            const href = target ? `/app/campaigns/${item.campaignId}/targets/${item.targetId}` : "/app/follow-ups";

            return (
              <Link
                key={item.id}
                href={href}
                className="block rounded-2xl border border-violet-500/10 bg-white p-4 transition hover:border-violet-500/25 hover:bg-violet-50/50 hover:shadow-lg hover:shadow-violet-950/5"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <Badge>{item.dueDate}</Badge>
                  <Badge tone="violet">{item.step}</Badge>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#120b2f]">{item.target}</p>
                    <p className="mt-1 text-sm text-[#120b2f]/55">{target ? `${target.role} at ${target.company}` : selectedCampaign.name}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#120b2f]/70">{item.reason}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-violet-500" />
                </div>
              </Link>
            );
          })}

          {campaignFollowUps.length === 0 ? (
            <EmptyState
              title="No open follow-ups for this campaign"
              description={`There are ${campaignTargets.length} targets in this workspace, but no due manual action right now.`}
            />
          ) : null}
        </CardContent>
      </Card>
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-violet-950/35 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-violet-500/20 bg-white p-5 shadow-2xl shadow-violet-950/25">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-neutral-950">Next message</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">Copy manually, send from your own channel, then mark the action.</Dialog.Description>
            </div>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-xl hover:bg-violet-50" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="rounded-2xl border border-violet-500/15 bg-violet-50/70 p-4 text-sm leading-6 text-neutral-800">{message}</div>
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
  const scopeLabel = source.linkedTarget ? "Prospect info" : "Campaign document";

  return (
    <Card className={cn("transition hover:-translate-y-1", source.missing && "border-amber-200 bg-amber-50/70")}>
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
          <Badge>{scopeLabel}</Badge>
          <Badge>{source.linkedCampaign}</Badge>
          {source.linkedTarget ? <Badge>{source.linkedTarget}</Badge> : null}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-neutral-500">
          <span>Updated {source.lastChecked}</span>
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
        <Button size="sm" variant="ghost">View</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-violet-950/35 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-violet-500/20 bg-white p-5 shadow-2xl shadow-violet-950/25">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-neutral-950">{source.title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">{source.type}</Dialog.Description>
            </div>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-xl hover:bg-violet-50" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Campaign" value={source.linkedCampaign} />
            <InfoRow label="Prospect" value={source.linkedTarget ?? "Campaign-level document"} />
            <InfoRow label="Link" value={source.url} />
            <InfoRow label="Last updated" value={source.lastChecked} />
            <p className="rounded-2xl border border-violet-500/10 bg-violet-50/70 p-3 leading-6 text-neutral-700">{source.description}</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-violet-500/10 bg-violet-50/40 px-3 py-2">
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
    <div className="rounded-2xl border border-dashed border-violet-300 bg-white p-8 text-center shadow-xl shadow-violet-950/5">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-violet-600 text-white">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{description}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {emptyStateExamples.map((example) => {
          const Icon = example.icon;
          return (
            <div key={example.title} className="rounded-2xl border border-violet-500/15 bg-violet-50/50 p-4 text-left">
              <Icon className="h-4 w-4 text-violet-700" />
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-violet-950/35 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-violet-500/20 bg-white p-5 shadow-2xl shadow-violet-950/25">
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
        <div key={step} className={cn("rounded-2xl border p-3", current === index ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-500/20" : index < current ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-violet-500/15 bg-white text-neutral-500")}>
          <p className="text-xs font-semibold">Step {index + 1}</p>
          <p className="mt-1 text-sm font-semibold">{step}</p>
        </div>
      ))}
    </div>
  );
}

import { createCampaignAction } from "@/app/actions/campaigns";

export function CampaignWizard() {
  const router = useRouter();
  const steps = ["Purpose", "Context", "Rules", "Targets", "Playbook"];
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<CampaignType>("Prospecting");
  const [selectedGoals, setSelectedGoals] = React.useState(["Prepare manual follow-up queue"]);
  const [selectedChannels, setSelectedChannels] = React.useState(["Gmail", "LinkedIn"]);
  const [customChannel, setCustomChannel] = React.useState("");
  const [contextSelections, setContextSelections] = React.useState<Record<string, string[]>>(defaultContextSelections);
  const [cadence, setCadence] = React.useState("Balanced");
  const [tone, setTone] = React.useState("Executive");
  const [stopRulesByType, setStopRulesByType] = React.useState<Record<CampaignType, string[]>>(defaultStopRulesByType);
  
  // New States for Targets
  const [wizardTargets, setWizardTargets] = React.useState<Array<{id: string, name: string, company: string, role: string, email: string, note?: string}>>([]);
  const [targetDraft, setTargetDraft] = React.useState({ name: "", company: "", role: "", email: "" });
  const [targetMode, setTargetMode] = React.useState<"paste" | "upload" | "manual">("manual");
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  
  // New States for Playbook
  const [wizardPlaybookStages, setWizardPlaybookStages] = React.useState<PlaybookStage[]>(playbookStages.slice(0, 4));
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingStageId, setEditingStageId] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof wizardSchema>>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "Q3 finance follow-up workspace",
      goal: "Book qualified discovery calls with finance leaders.",
      audience: "CFOs and VP Finance at SaaS teams",
    },
  });
  const campaignName = useWatch({ control: form.control, name: "name" });
  const campaignGoal = useWatch({ control: form.control, name: "goal" });
  const manualChannels = React.useMemo(
    () => [...selectedChannels, customChannel.trim()].filter(Boolean),
    [customChannel, selectedChannels],
  );
  const selectedCadence = cadenceOptions.find((option) => option.title === cadence)?.description ?? cadence;
  const selectedTone = toneOptions.find((option) => option.title === tone)?.description ?? tone;
  const contextProfile = campaignContextProfiles[type];
  const targetTableConfig = targetTableConfigByType[type];
  const workflowSteps = workflowStepsByType[type];
  const stopRules = stopRulesByType[type];
  const contextSummaryItems = contextProfile.panels.map((panel) => [
    panel.summaryLabel,
    contextSelections[panel.id] ?? [],
  ] as [string, string[]]);
  const contextMemoryValues = contextProfile.panels
    .flatMap((panel) => contextSelections[panel.id] ?? [])
    .slice(0, 5);
  const toggleContextSelection = (panelId: string, item: string) => {
    setContextSelections((current) => ({
      ...current,
      [panelId]: toggleChoice(current[panelId] ?? [], item),
    }));
  };
  const toggleStopRule = (item: string) => {
    setStopRulesByType((current) => ({
      ...current,
      [type]: toggleChoice(current[type] ?? [], item),
    }));
  };

  const handleAddTarget = () => {
    if (!targetDraft.name.trim() || !targetDraft.email.trim()) return;
    setWizardTargets(prev => [...prev, { id: Date.now().toString(), ...targetDraft }]);
    setTargetDraft({ name: "", company: "", role: "", email: "" });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
      const nameIdx = header.findIndex(h => h.includes("name"));
      const emailIdx = header.findIndex(h => h.includes("email"));
      const companyIdx = header.findIndex(h => h.includes("company") || h.includes("org"));
      const roleIdx = header.findIndex(h => h.includes("role") || h.includes("title") || h.includes("position"));
      const parsed = lines.slice(1).map((line, i) => {
        const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        return {
          id: `csv-${Date.now()}-${i}`,
          name: nameIdx >= 0 ? cols[nameIdx] : cols[0] || "",
          email: emailIdx >= 0 ? cols[emailIdx] : "",
          company: companyIdx >= 0 ? cols[companyIdx] : "",
          role: roleIdx >= 0 ? cols[roleIdx] : "",
        };
      }).filter(t => t.name);
      setWizardTargets(prev => [...prev, ...parsed]);
      if (csvInputRef.current) csvInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handlePasteTargets = (text: string) => {
    // Tab or comma-separated rows from a spreadsheet paste
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsed = lines.map((line, i) => {
      const cols = line.split(/\t|,/).map(c => c.trim());
      return {
        id: `paste-${Date.now()}-${i}`,
        name: cols[0] || "",
        company: cols[1] || "",
        role: cols[2] || "",
        email: cols[3] || "",
      };
    }).filter(t => t.name);
    setWizardTargets(prev => [...prev, ...parsed]);
  };

  const regenerationVariants: Record<string, string[]> = {
    short: [
      `Hi {{firstName}}, quick note — I noticed {{company}} runs a process we've helped optimize. Worth 10 minutes to compare notes?`,
      `{{firstName}}, saw a few signals that {{company}} might benefit from what we've built. Happy to share specifics?`,
      `Hey {{firstName}} — wanted to reach out because {{company}}'s context looked very relevant. Want a short breakdown?`,
    ],
    followup: [
      `Following up briefly, {{firstName}}. No pressure — just wanted to make sure this landed before moving on.`,
      `{{firstName}}, circling back in case timing is better this week. Totally understand if not.`,
      `Quick follow-up, {{firstName}}. Still think there's something useful here if the moment is right.`,
    ],
    value: [
      `One thing that resonates with teams like yours: cutting follow-up drift without a new tool. Want a quick demo?`,
      `Sharing one concrete outcome: teams using this approach reclaim 2–3 hours per rep per week on follow-up coordination.`,
      `Here's what tends to matter most for {{company}}-sized teams: keeping next actions visible without living in a CRM.`,
    ],
    breakup: [
      `I'll wrap up here, {{firstName}}. If the timing changes, I'm easy to reach.`,
      `Closing the loop for now — feel free to revisit this whenever it makes sense for you.`,
      `I won't keep following up, but if {{company}}'s priorities shift, happy to reconnect.`,
    ],
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setWizardPlaybookStages(prev => prev.map((stage, i) => {
      const pool = i === 0 ? regenerationVariants.short
        : i === prev.length - 1 ? regenerationVariants.breakup
        : i % 2 === 1 ? regenerationVariants.followup
        : regenerationVariants.value;
      const next = pool[Math.floor(Math.random() * pool.length)];
      return { ...stage, message: next };
    }));
    setIsRegenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const campaign = await createCampaignAction({
        name: campaignName,
        type: type,
        goal: campaignGoal,
        audience: form.getValues().audience || "",
        cadence: selectedCadence,
        tone: selectedTone,
        targets: wizardTargets,
        playbookStages: wizardPlaybookStages.map((stage, i) => ({
          title: stage.title,
          description: stage.condition || `Step ${i + 1}`,
          prompt: stage.message,              // the real message template content
          dayOffset: i === 0 ? 0 : i * 2,
          channel: "Email",
        })),
      });
      router.push(`/app/campaigns/${campaign.id}`);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={steps} current={step} />
      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>Build one manual follow-up workspace. AI prepares context, copy, and next actions; the user sends.</CardDescription>
        </CardHeader>
        <CardContent>
          {step > 0 ? (
            <CampaignContinuityCard
              name={campaignName}
              type={type}
              goal={campaignGoal}
              items={[
                ["Goal", selectedGoals],
                ["Manual channels", manualChannels],
                [contextProfile.memoryLabel, contextMemoryValues],
                ["Rules", [cadence, tone]],
              ]}
            />
          ) : null}
          {step === 0 && (
            <form className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                {purposeCampaignTypeOptions.map((option) => (
                  <CampaignTypeCard key={option.title} option={option} active={type === option.title} onClick={() => setType(option.title)} />
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <ChoicePanel
                  title="Main goal"
                  description="Pick the outcome this manual follow-up workspace should organize."
                  icon={<Flag className="h-4 w-4" />}
                  options={goalOptions}
                  selected={selectedGoals}
                  onToggle={(item) => setSelectedGoals((current) => toggleChoice(current, item))}
                  customPlaceholder="Write another goal..."
                />
                <ChannelPicker
                  selected={selectedChannels}
                  customValue={customChannel}
                  onCustomChange={setCustomChannel}
                  onToggle={(item) => setSelectedChannels((current) => toggleChoice(current, item))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Campaign name"><Input {...form.register("name")} /></Field>
                <Field label="Campaign type"><Input value={type} readOnly /></Field>
                <Field label="Extra context"><Input {...form.register("goal")} /></Field>
                <Field label="Deadline optional"><Input type="date" /></Field>
              </div>
              <SetupSummary
                items={[
                  ["Goals", selectedGoals],
                  ["Manual channels", manualChannels],
                ]}
              />
            </form>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                {contextProfile.panels.map((panel) => (
                  <div key={panel.id} className={panel.id.endsWith("Excluded") || panel.id.endsWith("Sources") ? "xl:col-span-2" : undefined}>
                    <ChoicePanel
                      title={panel.title}
                      description={panel.description}
                      icon={panel.icon}
                      options={panel.options}
                      selected={contextSelections[panel.id] ?? []}
                      onToggle={(item) => toggleContextSelection(panel.id, item)}
                      searchPlaceholder={panel.searchPlaceholder}
                      customPlaceholder={panel.customPlaceholder}
                    />
                  </div>
                ))}
              </div>
              <SetupSummary items={contextSummaryItems} title={`${contextProfile.memoryLabel} summary`} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <OptionTiles
                title="Follow-up cadence"
                icon={<Clock3 className="h-4 w-4" />}
                options={cadenceOptions}
                selected={cadence}
                onSelect={setCadence}
              />
              <OptionTiles
                title="Message tone"
                icon={<MessageCircle className="h-4 w-4" />}
                options={toneOptions}
                selected={tone}
                onSelect={setTone}
              />
              <ChoicePanel
                title="Stop conditions"
                description="Select what should move an item out of the manual follow-up queue."
                icon={<ShieldCheck className="h-4 w-4" />}
                options={stopConditionOptionsByType[type]}
                selected={stopRules}
                onToggle={toggleStopRule}
              />
              <div className="grid gap-3 md:grid-cols-4">
                {workflowSteps.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-violet-500/15 bg-violet-50/60 p-4 text-sm font-semibold">
                    <Badge tone={index === 0 ? "violet" : "neutral"} className="mb-3">Step {index + 1}</Badge>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {(["upload", "paste", "manual"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTargetMode(mode)}
                    className={cn(
                      "rounded-2xl border p-4 text-left font-semibold transition",
                      targetMode === mode
                        ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                        : "border-violet-500/15 bg-white hover:bg-violet-50"
                    )}
                  >
                    {mode === "upload" ? "Upload CSV" : mode === "paste" ? "Paste target table" : "Add one target"}
                  </button>
                ))}
              </div>

              {/* Hidden CSV file input */}
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVUpload} />

              {targetMode === "upload" && (
                <div className="rounded-2xl border border-dashed border-violet-400 bg-violet-50/40 p-6 text-center">
                  <p className="mb-1 font-semibold text-neutral-950">Upload a CSV file</p>
                  <p className="mb-4 text-sm text-neutral-500">Columns: name, email, company, role (any order, header required)</p>
                  <Button variant="secondary" onClick={() => csvInputRef.current?.click()}>
                    Choose CSV file
                  </Button>
                </div>
              )}

              {targetMode === "paste" && (
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Paste rows from a spreadsheet — columns in order: Name, Company, Role, Email</p>
                  <textarea
                    className="h-36 w-full rounded-xl border border-violet-500/15 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="Amelia Brooks&#9;Ferro Labs&#9;VP Finance&#9;amelia@ferrolabs.com"
                    onBlur={e => { if (e.target.value.trim()) { handlePasteTargets(e.target.value); e.target.value = ""; } }}
                  />
                </div>
              )}

              {targetMode === "manual" && (
                <div className="rounded-2xl border border-violet-500/15 bg-violet-50/30 p-4">
                  <p className="mb-3 text-sm font-semibold">Add one target manually</p>
                  <div className="grid gap-3 md:grid-cols-4">
                    <Input placeholder="Name *" value={targetDraft.name} onChange={e => setTargetDraft(p => ({ ...p, name: e.target.value }))} />
                    <Input placeholder="Email *" type="email" value={targetDraft.email} onChange={e => setTargetDraft(p => ({ ...p, email: e.target.value }))} />
                    <Input placeholder="Company" value={targetDraft.company} onChange={e => setTargetDraft(p => ({ ...p, company: e.target.value }))} />
                    <Input placeholder="Role" value={targetDraft.role} onChange={e => setTargetDraft(p => ({ ...p, role: e.target.value }))} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="secondary" onClick={handleAddTarget} disabled={!targetDraft.name || !targetDraft.email}>Add target</Button>
                  </div>
                </div>
              )}

              <SetupSummary
                title={`${contextProfile.targetSummaryLabel} carried into targets`}
                items={[
                  [contextProfile.targetSummaryLabel, contextMemoryValues],
                  ["Stop rules", stopRules],
                  ["Manual channels", manualChannels],
                ]}
              />
              <div className="overflow-hidden rounded-2xl border border-violet-500/15">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-violet-50 text-xs uppercase text-violet-900/55">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wizardTargets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                          No targets added yet.
                        </td>
                      </tr>
                    ) : (
                      wizardTargets.map((target) => (
                        <tr key={target.id} className="border-t border-neutral-100">
                          <td className="px-4 py-3">{target.name}</td>
                          <td className="px-4 py-3">{target.company}</td>
                          <td className="px-4 py-3">{target.role}</td>
                          <td className="px-4 py-3">{target.email}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setWizardTargets(prev => prev.filter(t => t.id !== target.id))}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <AISummaryCard title="AI Playbook preview">
                Prepared from {selectedGoals.join(", ")}, {manualChannels.join(" + ") || "manual channels"}, and the {contextProfile.previewLabel.toLowerCase()} selected earlier. AI drafts reviewed next actions only; no message is sent from here.
              </AISummaryCard>
              <SetupSummary
                title="Campaign memory"
                items={[
                  ["Campaign", [campaignName || "Untitled campaign", type]],
                  [contextProfile.previewLabel, contextMemoryValues],
                  ["Manual rules", [selectedCadence, selectedTone, ...stopRules.slice(0, 2)]],
                ]}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                {isRegenerating ? (
                  <div className="col-span-2 py-12 text-center text-neutral-500">
                    <RefreshCcw className="mx-auto mb-4 h-6 w-6 animate-spin" />
                    <p>AI is generating new message variations...</p>
                  </div>
                ) : (
                  wizardPlaybookStages.map((stage) => (
                    editingStageId === stage.id ? (
                      <Card key={stage.id}>
                        <CardContent className="space-y-3 pt-5">
                          <Input
                            value={stage.title}
                            onChange={e => setWizardPlaybookStages(prev => prev.map(s => s.id === stage.id ? { ...s, title: e.target.value } : s))}
                            placeholder="Stage title"
                          />
                          <textarea
                            className="w-full rounded-xl border border-violet-500/15 p-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-violet-200"
                            rows={4}
                            value={stage.message}
                            onChange={e => setWizardPlaybookStages(prev => prev.map(s => s.id === stage.id ? { ...s, message: e.target.value } : s))}
                            placeholder="Message content"
                          />
                          <Input
                            value={stage.condition}
                            onChange={e => setWizardPlaybookStages(prev => prev.map(s => s.id === stage.id ? { ...s, condition: e.target.value } : s))}
                            placeholder="Condition / send rule"
                          />
                          <div className="flex justify-end">
                            <Button size="sm" variant="secondary" onClick={() => setEditingStageId(null)}>Done</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div key={stage.id} className="relative">
                        <PlaybookStageCard stage={stage} />
                        <button
                          onClick={() => setEditingStageId(stage.id)}
                          className="absolute right-3 top-3 rounded-lg border border-violet-500/15 bg-white px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                        >
                          Edit
                        </button>
                      </div>
                    )
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleRegenerate} disabled={isRegenerating}>
                  <RefreshCcw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />Regenerate
                </Button>
                <Button variant="secondary" onClick={() => setEditingStageId(wizardPlaybookStages[0]?.id ?? null)}>
                  <FileText className="h-4 w-4" />Edit manually
                </Button>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t border-neutral-100 pt-5">
            <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || isSaving}>Back</Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save campaign"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
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

function CampaignContinuityCard({
  name,
  type,
  goal,
  items,
}: {
  name: string;
  type: CampaignType;
  goal: string;
  items: [string, string[]][];
}) {
  return (
    <section className="mb-5 rounded-2xl border border-violet-500/15 bg-violet-50/70 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="violet">{type}</Badge>
            <Badge tone="emerald">Manual send only</Badge>
          </div>
          <h3 className="mt-2 truncate text-base font-semibold text-neutral-950">{name || "Untitled campaign"}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-600">{goal || "No extra context yet."}</p>
        </div>
        <div className="rounded-xl border border-violet-500/15 bg-white px-3 py-2 text-xs font-semibold text-violet-800">
          Earlier choices stay active
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-4">
        {items.map(([label, values]) => (
          <div key={label} className="rounded-xl border border-violet-500/10 bg-white p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {values.length ? <SummaryValues label={label} values={values.slice(0, 4)} /> : <span className="text-xs text-neutral-400">No selection</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChoicePanel({
  title,
  description,
  icon,
  options,
  selected,
  onToggle,
  searchPlaceholder,
  customPlaceholder,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
  searchPlaceholder?: string;
  customPlaceholder?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [customValue, setCustomValue] = React.useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.toLowerCase().includes(normalizedQuery))
    : options;

  return (
    <section className="rounded-2xl border border-violet-500/15 bg-white p-4 shadow-lg shadow-violet-950/5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-neutral-950">{title}</h3>
              <Badge tone="violet">{selected.length}</Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
          </div>
        </div>
        {selected.length ? (
          <button type="button" onClick={() => selected.forEach(onToggle)} className="shrink-0 text-xs font-semibold text-neutral-400 hover:text-neutral-700">
            Clear
          </button>
        ) : null}
      </div>
      {searchPlaceholder ? (
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="pl-9" />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {filteredOptions.map((option) => (
          <ChoicePill key={option} label={option} active={selected.includes(option)} onClick={() => onToggle(option)} />
        ))}
      </div>
      {customPlaceholder ? (
        <div className="mt-3 flex gap-2">
          <Input value={customValue} onChange={(event) => setCustomValue(event.target.value)} placeholder={customPlaceholder} />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const value = customValue.trim();
              if (!value) return;
              onToggle(value);
              setCustomValue("");
            }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function ChoicePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition",
        active
          ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
          : "border-violet-500/15 bg-white text-neutral-700 hover:border-violet-300 hover:bg-violet-50",
      )}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

function ChannelPicker({
  selected,
  customValue,
  onCustomChange,
  onToggle,
}: {
  selected: string[];
  customValue: string;
  onCustomChange: (value: string) => void;
  onToggle: (item: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-violet-500/15 bg-white p-4 shadow-lg shadow-violet-950/5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <MailCheck className="h-4 w-4" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-neutral-950">Manual channels</h3>
            <Badge tone="violet">{selected.length}</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Pick where the user will copy, send, and then mark the action as done.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {channelOptions.map((channel) => {
          const active = selected.includes(channel.name);
          return (
            <button
              key={channel.name}
              type="button"
              onClick={() => onToggle(channel.name)}
              className={cn(
                "flex h-14 items-center gap-3 rounded-2xl border px-3 text-left text-sm font-semibold transition",
                active
                  ? "border-violet-500 bg-violet-50 text-violet-950 ring-2 ring-violet-100"
                  : "border-violet-500/15 bg-white text-neutral-700 hover:bg-violet-50",
              )}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-500/10 bg-white">
                <Image src={channel.logo} alt={`${channel.name} logo`} width={24} height={24} className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1 truncate">{channel.name}</span>
              {active ? <Check className="h-4 w-4 text-violet-700" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        <Field label="Another channel">
          <Input value={customValue} onChange={(event) => onCustomChange(event.target.value)} placeholder="Write another channel..." />
        </Field>
      </div>
    </section>
  );
}

function OptionTiles({
  title,
  icon,
  options,
  selected,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  options: { title: string; description: string }[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 font-semibold text-neutral-950">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-50 text-violet-700">{icon}</span>
        {title}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const active = selected === option.title;
          return (
            <button
              key={option.title}
              type="button"
              onClick={() => onSelect(option.title)}
              className={cn(
                "min-h-24 rounded-2xl border p-4 text-left transition",
                active
                  ? "border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10 ring-2 ring-violet-100"
                  : "border-violet-500/15 bg-white hover:bg-violet-50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-neutral-950">{option.title}</p>
                {active ? <Check className="h-4 w-4 text-violet-700" /> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SetupSummary({ items, title = "Selection summary" }: { items: [string, string[]][]; title?: string }) {
  return (
    <div className="rounded-2xl border border-violet-500/15 bg-violet-50/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-950">
        <Sparkles className="h-4 w-4 text-violet-700" />
        {title}
      </div>
      <div className="space-y-2">
        {items.map(([label, values]) => (
          <div key={label} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-28 shrink-0 font-semibold text-neutral-600">{label}</span>
            {values.length ? <SummaryValues label={label} values={values} tone="violet" /> : <span className="text-neutral-400">No selection</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryValues({ label, values, tone = "neutral" }: { label: string; values: string[]; tone?: React.ComponentProps<typeof Badge>["tone"] }) {
  if (label.toLowerCase().includes("channel")) {
    return <ChannelLogoPill channels={values} />;
  }

  return values.map((value) => <Badge key={value} tone={tone}>{value}</Badge>);
}

function ChannelLogoPill({ channels }: { channels: string[] }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 shadow-sm">
      {channels.map((channel) => {
        const knownChannel = channelOptions.find((option) => option.name === channel);

        return knownChannel ? (
          <Image
            key={channel}
            src={knownChannel.logo}
            alt={`${channel} logo`}
            width={18}
            height={18}
            className="h-4.5 w-4.5"
          />
        ) : (
          <span key={channel} className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-700">
            {channel.slice(0, 2).toUpperCase()}
          </span>
        );
      })}
    </span>
  );
}

export function CampaignTabs({
  campaignId,
  targets: campaignTargets = [],
  playbookStages: stages = [],
  dataSources: sources = [],
  followUps: campaignFollowUps = [],
  activityEvents = [],
}: {
  campaignId: string;
  targets?: any[];
  playbookStages?: any[];
  dataSources?: any[];
  followUps?: any[];
  activityEvents?: any[];
}) {
  const [localSources, setLocalSources] = React.useState<any[]>(sources);

  const handleAddDoc = async (draft: any) => {
    const { addDataSource } = await import("@/app/actions/data-directory");
    const source = await addDataSource({
      title: draft.title,
      type: draft.type,
      url: draft.url || undefined,
      description: draft.description || undefined,
      campaignId,
    });
    setLocalSources((prev) => [
      {
        id: source.id,
        title: source.title,
        type: draft.type,
        url: source.url || "",
        description: source.description || "",
        campaignId,
        linkedCampaign: "",
        importance: "MEDIUM",
        lastChecked: "Just now",
        missing: false,
      },
      ...prev,
    ]);
  };

  return (
    <Tabs.Root defaultValue="targets" className="space-y-5">
      <Tabs.List className="flex gap-2 overflow-x-auto rounded-2xl border border-violet-500/15 bg-white p-1 shadow-xl shadow-violet-950/5">
        {["overview", "targets", "playbook", "follow-ups", "documents", "activity"].map((tab) => (
          <Tabs.Trigger key={tab} value={tab} className="rounded-xl px-3 py-2 text-sm font-semibold capitalize text-neutral-500 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            {tab}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="overview" className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <AISummaryCard>
          {campaignTargets.length === 0
            ? "Add your first prospects in the Targets tab. Once added, their follow-up actions and messages will appear here."
            : "Prioritize replies, then due follow-ups, then missing documents or prospect notes. Campaign health is strongest when every target has a visible next action."}
        </AISummaryCard>
        <Card>
          <CardHeader><CardTitle>Next actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {campaignFollowUps.length === 0 ? (
              <p className="text-sm text-neutral-500">No follow-ups due. Add prospects to get started.</p>
            ) : (
              campaignFollowUps.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-violet-500/10 bg-violet-50/60 p-3 text-sm">
                  <span>{item.target} - {item.reason}</span>
                  <PriorityBadge priority={item.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Tabs.Content>
      <Tabs.Content value="targets">
        {campaignTargets.length === 0 ? (
          <EmptyState title="No prospects yet" description="Prospects are added when you create or import targets into this campaign." />
        ) : (
          <TargetTable rows={campaignTargets as any} />
        )}
      </Tabs.Content>
      <Tabs.Content value="playbook" className="grid gap-4 lg:grid-cols-2">
        {stages.length === 0 ? (
          <div className="col-span-2">
            <EmptyState title="No playbook stages" description="Playbook stages are generated when you create a campaign using the wizard." />
          </div>
        ) : (
          stages.map((stage: any) => <PlaybookStageCard key={stage.id} stage={stage} />)
        )}
      </Tabs.Content>
      <Tabs.Content value="follow-ups">
        {campaignFollowUps.length === 0 ? (
          <EmptyState title="No follow-ups yet" description="Follow-ups appear here once prospects have been added and actions are triggered." />
        ) : (
          <FollowUpQueue rows={campaignFollowUps as any} />
        )}
      </Tabs.Content>
      <Tabs.Content value="documents">
        <CampaignDocumentsTab sources={localSources} onAdd={handleAddDoc} campaignId={campaignId} />
      </Tabs.Content>
      <Tabs.Content value="activity">
        {activityEvents.length === 0 ? (
          <EmptyState title="No activity yet" description="Activity is logged as you add prospects, send follow-ups, and update documents." />
        ) : (
          <Timeline events={activityEvents as any} />
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}


function CampaignDocumentsTab({ sources, onAdd, campaignId }: { sources: any[]; onAdd: (draft: any) => void; campaignId: string }) {
  const [draft, setDraft] = React.useState<DirectoryDraft>({ title: "", type: "Note", url: "", description: "" });
  const [localSources, setLocalSources] = React.useState<any[]>(sources);

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    await onAdd(draft);
    setLocalSources((prev) => [{ id: Date.now().toString(), title: draft.title, type: draft.type, url: draft.url, description: draft.description, lastChecked: "Just now" }, ...prev]);
    setDraft({ title: "", type: "Note", url: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <DirectoryDraftForm
        draft={draft}
        onChange={setDraft}
        onAdd={handleAdd}
        title="Attach document to campaign"
        buttonLabel="Add document"
        placeholder="Contract, folder, invoice, reference link..."
      />
      {localSources.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {localSources.map((source: any) => (
            <div key={source.id} className="rounded-2xl border border-violet-500/10 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-950">{source.title}</p>
                  <Badge tone="blue" className="mt-1">{String(source.type).replace(/_/g, " ")}</Badge>
                  {source.description && <p className="mt-2 text-sm text-neutral-500">{source.description}</p>}
                </div>
                {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700"><ExternalLink className="h-4 w-4" /></a>}
              </div>
              <p className="mt-3 text-xs text-neutral-400">Last checked: {source.lastChecked}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No documents attached" description="Add contracts, folders, invoices, checklists, or shared links used by this campaign." />
      )}
    </div>
  );
}

export function TargetDataDirectory({ targetId }: { targetId: string }) {
  const initialSources = getSourcesForTarget(targetId);
  const [items, setItems] = React.useState<DataSource[]>(initialSources);
  const [draft, setDraft] = React.useState<DirectoryDraft>({
    title: "",
    type: "Note",
    url: "",
    description: "",
  });

  const addItem = () => {
    if (!draft.title.trim()) return;
    setItems((current) => [
      {
        id: `target-item-${Date.now()}`,
        title: draft.title.trim(),
        type: draft.type,
        url: draft.url.trim() || "#",
        campaignId: "unknown",
        targetId: targetId,
        linkedCampaign: "Campaign",
        linkedTarget: "Target",
        description: draft.description.trim() || "Prospect-specific note, document, or link.",
        importance: "Medium",
        lastChecked: "Just now",
      },
      ...current,
    ]);
    setDraft({ title: "", type: "Note", url: "", description: "" });
  };

  const deleteItem = (itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  return (
    <div className="space-y-6">
      <DirectoryDraftForm
        draft={draft}
        onChange={setDraft}
        onAdd={addItem}
        title="Attach to prospect"
        buttonLabel="Add prospect item"
        placeholder="Profile link, call note, email thread, signed doc..."
      />
      {items.length ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between py-3 border-b border-violet-500/10 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#120b2f]">{item.title}</span>
                  <Badge tone={item.missing ? "amber" : "blue"}>{item.type}</Badge>
                </div>
                {item.description && <p className="mt-1 text-sm text-[#120b2f]/60">{item.description}</p>}
                <div className="mt-2 flex items-center gap-3 text-xs text-[#120b2f]/45">
                  <span>Updated {item.lastChecked}</span>
                  {item.url && item.url !== "#" && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition">
                      <ExternalLink className="h-3 w-3" />
                      <span>Link</span>
                    </a>
                  )}
                </div>
              </div>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-[#120b2f]/40 hover:text-rose-600 hover:bg-rose-50 ml-4" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No prospect notes attached" description="Add notes, profile links, conversation details, documents, invoices, or any information specific to this prospect." />
      )}
    </div>
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
    ["Campaign documents", dataSources.filter((source) => !source.targetId)],
    ["Prospect notes & info", dataSources.filter((source) => source.targetId && !source.missing)],
    ["Missing documents / info", dataSources.filter((source) => source.missing)],
    ["Recently updated", dataSources.slice(0, 3)],
  ] as const;

  return (
    <Tabs.Root defaultValue={groups[0][0]} className="space-y-5">
      <Tabs.List className="flex flex-wrap gap-2 rounded-2xl border border-violet-500/15 bg-white p-2 shadow-xl shadow-violet-950/5">
        {groups.map(([group]) => (
          <Tabs.Trigger key={group} value={group} className="rounded-xl border border-violet-500/15 bg-white px-3 py-2 text-sm font-semibold text-violet-950/60 data-[state=active]:border-violet-600 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
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

type DirectoryDraft = {
  title: string;
  type: string;
  url: string;
  description: string;
};

const emptyDirectoryDraft: DirectoryDraft = {
  title: "",
  type: "Document",
  url: "",
  description: "",
};

const directoryItemTypes = ["Document", "Link", "Note", "Drive folder", "Email thread", "Invoice", "Contract"];

type DirectoryDataSource = {
  id: string; title: string; type: string; url: string; description: string; campaignId: string; targetId?: string; linkedCampaign?: string; linkedTarget?: string; missing?: boolean; importance: string; lastChecked: string;
};

export function DataDirectoryWorkspace({
  initialCampaigns = [],
  initialTargets = [],
  initialDataSources = [],
}: {
  initialCampaigns?: any[];
  initialTargets?: any[];
  initialDataSources?: DirectoryDataSource[];
}) {
  const [selectedCampaignId, setSelectedCampaignId] = React.useState(initialCampaigns[0]?.id ?? "");
  const [selectedTargetId, setSelectedTargetId] = React.useState(initialTargets.find((target) => target.campaignId === selectedCampaignId)?.id ?? "");
  const [items, setItems] = React.useState<DirectoryDataSource[]>(initialDataSources);
  const [campaignDraft, setCampaignDraft] = React.useState<DirectoryDraft>({
    title: "Campaign folder",
    type: "Drive folder",
    url: "https://example.com/folder",
    description: "Shared folder with documents attached to this campaign.",
  });
  const [targetDraft, setTargetDraft] = React.useState<DirectoryDraft>({
    title: "Prospect note",
    type: "Note",
    url: "",
    description: "Useful detail to keep before the next follow-up.",
  });

  const selectedCampaign = initialCampaigns.find((campaign) => campaign.id === selectedCampaignId) ?? initialCampaigns[0];
  const campaignTargets = initialTargets.filter((target) => target.campaignId === selectedCampaign?.id);
  const selectedTarget = campaignTargets.find((target) => target.id === selectedTargetId) ?? campaignTargets[0];
  const campaignItems = items.filter((item) => item.campaignId === selectedCampaign?.id && !item.targetId);
  const targetItems = selectedTarget ? items.filter((item) => item.targetId === selectedTarget.id) : [];
  const missingCount = items.filter((item) => item.campaignId === selectedCampaign?.id && item.missing).length;

  const chooseCampaign = (campaignId: string) => {
    const firstTarget = initialTargets.find((target) => target.campaignId === campaignId);
    setSelectedCampaignId(campaignId);
    setSelectedTargetId(firstTarget?.id ?? "");
  };

  if (!selectedCampaign) {
    return <div className="p-8 text-center text-neutral-500">No campaigns or targets available.</div>;
  }

  const addCampaignItem = async () => {
    if (!campaignDraft.title.trim()) return;

    const source = await addDataSource({
      title: campaignDraft.title.trim(),
      type: campaignDraft.type,
      url: campaignDraft.url.trim() || undefined,
      description: campaignDraft.description.trim() || undefined,
      campaignId: selectedCampaign.id,
    });

    setItems((current) => [
      {
        id: source.id,
        title: source.title,
        type: campaignDraft.type,
        url: source.url || "",
        campaignId: selectedCampaign.id,
        linkedCampaign: selectedCampaign.name,
        description: source.description || "",
        importance: "Medium",
        lastChecked: "Just now",
      },
      ...current,
    ]);
    setCampaignDraft(emptyDirectoryDraft);
  };

  const addTargetItem = async () => {
    if (!selectedTarget || !targetDraft.title.trim()) return;

    const source = await addDataSource({
      title: targetDraft.title.trim(),
      type: targetDraft.type,
      url: targetDraft.url.trim() || undefined,
      description: targetDraft.description.trim() || undefined,
      campaignId: selectedCampaign.id,
      targetId: selectedTarget.id,
    });

    setItems((current) => [
      {
        id: source.id,
        title: source.title,
        type: targetDraft.type,
        url: source.url || "",
        campaignId: selectedCampaign.id,
        targetId: selectedTarget.id,
        linkedCampaign: selectedCampaign.name,
        linkedTarget: selectedTarget.name,
        description: source.description || "",
        importance: "Medium",
        lastChecked: "Just now",
      },
      ...current,
    ]);
    setTargetDraft(emptyDirectoryDraft);
  };

  const deleteItem = async (itemId: string) => {
    await deleteDataSource(itemId);
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Campaign data</CardTitle>
            <CardDescription>Select a campaign and keep its shared documents, folders, and links in one place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {initialCampaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => chooseCampaign(campaign.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-violet-50",
                    selectedCampaign.id === campaign.id ? "border-violet-600 bg-violet-50 shadow-lg shadow-violet-500/10" : "border-violet-500/15 bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#120b2f]">{campaign.name}</p>
                      <p className="mt-1 truncate text-sm text-[#120b2f]/55">{campaign.type}</p>
                    </div>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone="violet">{campaign.targets} prospects</Badge>
                    <Badge tone={missingCount ? "amber" : "emerald"}>{selectedCampaign.id === campaign.id ? missingCount : items.filter((item) => item.campaignId === campaign.id && item.missing).length} gaps</Badge>
                  </div>
                </button>
              ))}
            </div>
            <Button asChild variant="secondary">
              <Link href={`/app/campaigns/${selectedCampaign.id}`}>Open campaign<ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedCampaign.name}</CardTitle>
            <CardDescription>{selectedCampaign.goal}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <DirectoryDraftForm
              draft={campaignDraft}
              onChange={setCampaignDraft}
              onAdd={addCampaignItem}
              title="Attach to campaign"
              buttonLabel="Add campaign item"
              placeholder="Contract, onboarding folder, invoice PDF..."
            />
            <DirectoryItemList
              items={campaignItems as any}
              emptyTitle="No campaign documents yet"
              emptyDescription="Add contracts, folders, invoices, checklists, or shared links used by this campaign."
              onDelete={deleteItem}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Prospects</CardTitle>
            <CardDescription>Choose a prospect inside the selected campaign, then manage their own notes, documents, and links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaignTargets.length ? campaignTargets.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => setSelectedTargetId(target.id)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition hover:bg-violet-50",
                  selectedTarget?.id === target.id ? "border-violet-600 bg-violet-50 shadow-lg shadow-violet-500/10" : "border-violet-500/15 bg-white",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#120b2f]">{target.name}</p>
                    <p className="mt-1 truncate text-sm text-[#120b2f]/55">{target.role}, {target.company}</p>
                  </div>
                  <TargetStatusBadge status={target.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{items.filter((item) => item.targetId === target.id).length} items</Badge>
                  <Badge tone={target.priority === "High" ? "rose" : target.priority === "Medium" ? "amber" : "blue"}>{target.priority}</Badge>
                </div>
              </button>
            )) : (
              <EmptyState title="No prospects in this campaign" description="Add targets in the campaign before linking prospect-specific notes." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{selectedTarget ? selectedTarget.name : "Select a prospect"}</CardTitle>
                <CardDescription>
                  {selectedTarget ? `${selectedTarget.role}, ${selectedTarget.company}. Add private context for this exact prospect.` : "Pick a prospect to manage their information."}
                </CardDescription>
              </div>
              {selectedTarget ? (
                <Button asChild variant="secondary">
                  <Link href={`/app/campaigns/${selectedCampaign.id}/targets/${selectedTarget.id}`}>Open prospect<ChevronRight className="h-4 w-4" /></Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <DirectoryDraftForm
              draft={targetDraft}
              onChange={setTargetDraft}
              onAdd={addTargetItem}
              title="Attach to prospect"
              buttonLabel="Add prospect item"
              placeholder="Profile link, call note, email thread, signed doc..."
              disabled={!selectedTarget}
            />
            <DirectoryItemList
              items={targetItems as any}
              emptyTitle="No prospect information yet"
              emptyDescription="Add a note, useful profile link, conversation detail, document, or email thread for this prospect."
              onDelete={deleteItem}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function DirectoryDraftForm({
  draft,
  onChange,
  onAdd,
  title,
  buttonLabel,
  placeholder,
  disabled = false,
}: {
  draft: DirectoryDraft;
  onChange: (draft: DirectoryDraft) => void;
  onAdd: () => void;
  title: string;
  buttonLabel: string;
  placeholder: string;
  disabled?: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const inferredType = lowerName.includes("invoice")
      ? "Invoice"
      : lowerName.includes("contract")
        ? "Contract"
        : "Document";

    onChange({
      title: draft.title.trim() || file.name,
      type: inferredType,
      url: `Uploaded file: ${file.name}`,
      description: draft.description.trim() || `${file.name} selected for upload.`,
    });
    event.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-violet-500/15 bg-violet-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-violet-700" />
        <p className="text-sm font-semibold text-[#120b2f]">{title}</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.txt"
      />
      <div className="grid gap-3 lg:grid-cols-[1fr_160px]">
        <Input
          disabled={disabled}
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
          placeholder={placeholder}
        />
        <select
          disabled={disabled}
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value })}
          className="h-10 rounded-md border border-violet-500/15 bg-white px-3 text-sm font-medium text-[#120b2f] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
        >
          {directoryItemTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </div>
      <Input
        disabled={disabled}
        value={draft.url}
        onChange={(event) => onChange({ ...draft, url: event.target.value })}
        placeholder="Optional link"
        className="mt-3"
      />
      <textarea
        disabled={disabled}
        value={draft.description}
        onChange={(event) => onChange({ ...draft, description: event.target.value })}
        placeholder="Short context for the team"
        className="mt-3 min-h-20 w-full resize-none rounded-md border border-violet-500/15 bg-white px-3 py-2 text-sm text-[#120b2f] outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
      />
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          <Upload className="h-4 w-4" />
          Upload file
        </Button>
        <Button type="button" onClick={onAdd} disabled={disabled || !draft.title.trim()}>
          <Plus className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

function DirectoryItemList({
  items,
  emptyTitle,
  emptyDescription,
  onDelete,
}: {
  items: DataSource[];
  emptyTitle: string;
  emptyDescription: string;
  onDelete: (itemId: string) => void;
}) {
  return items.length ? (
    <div className="overflow-hidden rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] shadow-inner">
      {items.map((item) => <DirectoryEditableItem key={item.id} item={item} onDelete={onDelete} />)}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-violet-300 bg-white p-6 text-center">
      <p className="font-semibold text-[#120b2f]">{emptyTitle}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#120b2f]/55">{emptyDescription}</p>
    </div>
  );
}

function DirectoryEditableItem({ item, onDelete }: { item: DataSource; onDelete: (itemId: string) => void }) {
  const titleLower = item.title.toLowerCase();
  
  let Icon = FileText;
  let iconColor = "text-neutral-400";
  let bgColor = "bg-[#202020]";
  let size = "14,4 KB";

  if (titleLower.endsWith(".pdf")) {
    Icon = FileText;
    iconColor = "text-rose-500";
    size = "119 KB";
  } else if (titleLower.endsWith(".csv")) {
    Icon = FileSpreadsheet;
    iconColor = "text-sky-400";
    size = "20,9 KB";
  } else if (titleLower.endsWith(".xlsx") || titleLower.endsWith(".xls")) {
    Icon = FileSpreadsheet;
    iconColor = "text-emerald-500";
    size = "14,4 KB";
  } else if (titleLower.endsWith(".png") || titleLower.endsWith(".jpg") || titleLower.endsWith(".jpeg")) {
    Icon = FileImage;
    iconColor = "text-neutral-300";
    bgColor = "bg-white";
    size = "70,0 KB";
  } else {
    Icon = FileText;
    iconColor = "text-violet-400";
    size = "12 KB";
  }

  // Derive a pseudo "day" based on the length to add variety like the screenshot
  const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const day = days[item.title.length % 7];

  return (
    <article className="group flex items-center justify-between gap-4 bg-[#0a0a0a] p-3 pl-4 pr-5 text-sm text-neutral-300 transition-colors hover:bg-[#141414] border-b border-[#1a1a1a] last:border-0">
      <div className="flex flex-1 min-w-0 items-center gap-4">
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", bgColor)}>
          {titleLower.endsWith(".png") || titleLower.endsWith(".jpg") || titleLower.endsWith(".jpeg") ? (
             null // If bg is white, it acts as the white square icon from the screenshot
          ) : (
            <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2.5} />
          )}
        </div>
        <p className="truncate text-[13px] font-medium text-neutral-200">{item.title}</p>
      </div>
      
      <div className="flex items-center gap-6 text-neutral-400 text-[13px]">
        <span className="hidden sm:block w-20 text-left capitalize">{day}</span>
        <span className="w-16 text-right">{size}</span>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-800 text-neutral-500 hover:text-rose-500" 
          aria-label={`Delete ${item.title}`} 
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              name: `${firstName} ${lastName}`.trim() || undefined,
              first_name: firstName,
              last_name: lastName
            } 
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data?.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
        }

        setSuccess(true);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (data?.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
        }

        window.location.href = "/app/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f7f5f0] lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight text-[#332252]/90 transition-colors hover:text-[#332252]">
          <span className="grid h-8 w-8 place-items-center text-violet-600">
            <LeafLogo className="h-8 w-8" />
          </span>
          verytis
        </Link>
        <div className="my-16 max-w-xl">
          <Badge tone="violet">14-day free trial</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            {mode === "login" ? "Welcome back to your campaign cockpit." : "Start your free trial. No card required."}
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Generate playbooks, manage target context, and keep follow-ups visible without automatic sending.
          </p>
        </div>
        <p className="text-sm text-neutral-500">verytis — Follow-up cockpit</p>
      </div>
      <div className="flex items-center justify-center border-l border-neutral-200 bg-white p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Log in" : "Create account"}</CardTitle>
            <CardDescription>{mode === "login" ? "Continue to your workspace." : "Start your 14-day free trial."}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="font-semibold text-emerald-800">Check your email</p>
                <p className="mt-2 text-sm text-emerald-700/70">
                  We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
                {mode === "signup" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First name">
                      <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Last name">
                      <Input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                      />
                    </Field>
                  </div>
                ) : null}
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </Field>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-neutral-700">Password</label>
                    {mode === "login" ? (
                      <Link href="/forgot-password" className="text-sm font-semibold text-violet-600 hover:text-violet-700 hover:underline">
                        Forgot password?
                      </Link>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" variant="accent" disabled={loading}>
                  {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
                </Button>
                <p className="text-center text-sm text-neutral-500">
                  {mode === "login" ? "No account yet? " : "Already have an account? "}
                  <Link className="font-semibold text-neutral-950" href={mode === "login" ? "/signup" : "/login"}>
                    {mode === "login" ? "Sign up" : "Log in"}
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 overflow-hidden rounded-[2rem] border border-violet-500/15 bg-[radial-gradient(circle_at_90%_0%,rgba(167,139,250,0.20),transparent_30%),linear-gradient(135deg,#ffffff_0%,#fbf9ff_100%)] p-6 text-[#120b2f] shadow-2xl shadow-violet-950/10 backdrop-blur md:flex md:items-end md:justify-between md:gap-4">
      <div>
        {eyebrow ? <Badge tone="violet" className="mb-3">{eyebrow}</Badge> : null}
        <h1 className="text-3xl font-bold tracking-tight text-[#120b2f] md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#120b2f]/62 md:text-base">{description}</p> : null}
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
          Next best work: handle replies, send high-priority nudges, and add missing documents or prospect notes before copying new messages.
        </AISummaryCard>
      </div>
    </div>
  );
}

export function LeafLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M62 394C92 292 184 236 270 193C350 153 402 102 432 42C442 124 412 205 348 253C308 283 263 302 217 318C274 320 331 306 383 271C355 335 301 376 226 386C153 396 96 398 62 466"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M220 319C286 304 345 266 392 207C382 270 348 318 293 350C242 379 184 393 119 390"
        stroke="currentColor"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
