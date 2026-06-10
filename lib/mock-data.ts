import {
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileCheck2,
  Handshake,
  Inbox,
  type LucideIcon,
  Megaphone,
  Users,
} from "lucide-react";

export type CampaignType =
  | "Prospecting"
  | "Recruiting"
  | "HR request"
  | "Client documents"
  | "Invoice follow-up"
  | "Vendor follow-up"
  | "Custom";

export type CampaignStatus = "Active" | "Waiting" | "Blocked" | "Completed" | "Review";
export type TargetStatus = "Not contacted" | "Contacted" | "Replied" | "Blocked" | "Completed" | "Snoozed";
export type Priority = "High" | "Medium" | "Low";

export type Campaign = {
  id: string;
  name: string;
  type: CampaignType;
  goal: string;
  status: CampaignStatus;
  targets: number;
  progress: number;
  followUpsDue: number;
  replies: number;
  blocked: number;
  completed: number;
  owner: string;
  lastActivity: string;
  deadline: string;
  channel: string;
  summary: {
    situation: string;
    progress: string;
    blockers: string;
    nextPriorities: string[];
    health: string;
  };
};

export type Target = {
  id: string;
  campaignId: string;
  name: string;
  company: string;
  role: string;
  email: string;
  note: string;
  status: TargetStatus;
  currentStep: string;
  priority: Priority;
  lastAction: string;
  nextAction: string;
  due: string;
  sourceCount: number;
  summary: {
    who: string;
    why: string;
    happened: string;
    blocker: string;
    next: string;
    sources: string[];
  };
};

export type PlaybookStage = {
  id: string;
  campaignId: string;
  title: string;
  delay: string;
  status: "Ready" | "Editable" | "Conditional";
  condition: string;
  message: string;
};

export type FollowUp = {
  id: string;
  campaignId: string;
  targetId: string;
  dueDate: string;
  campaign: string;
  target: string;
  reason: string;
  step: string;
  priority: Priority;
  message: string;
};

export type DataSource = {
  id: string;
  title: string;
  type: string;
  url: string;
  campaignId: string;
  targetId?: string;
  linkedCampaign: string;
  linkedTarget?: string;
  description: string;
  importance: Priority;
  lastChecked: string;
  missing?: boolean;
};

export type Template = {
  id: string;
  category: CampaignType;
  title: string;
  description: string;
  steps: string[];
};

export type TimelineEvent = {
  id: string;
  campaignId: string;
  targetId?: string;
  title: string;
  description: string;
  time: string;
};

export type CampaignTypeOption = {
  title: CampaignType;
  description: string;
  icon: LucideIcon;
};

export const appName = "FollowPilot";

export const campaignTypeOptions: CampaignTypeOption[] = [
  { title: "Prospecting", description: "Outbound sales sequences with manual follow-ups.", icon: Megaphone },
  { title: "Recruiting", description: "Candidate outreach, reminders, and hiring coordination.", icon: BriefcaseBusiness },
  { title: "HR request", description: "Internal people requests with escalation rules.", icon: Users },
  { title: "Client documents", description: "Collect contracts, forms, and missing evidence.", icon: FileCheck2 },
  { title: "Invoice follow-up", description: "Payment reminders and finance handoffs.", icon: CircleDollarSign },
  { title: "Vendor follow-up", description: "Coordinate suppliers without losing context.", icon: Handshake },
  { title: "Custom", description: "Build a campaign around any repeatable goal.", icon: Inbox },
];

export const campaigns: Campaign[] = [
  {
    id: "northstar-q3",
    name: "Northstar Q3 pipeline",
    type: "Prospecting",
    goal: "Book qualified discovery calls with finance leaders at mid-market SaaS teams.",
    status: "Active",
    targets: 42,
    progress: 64,
    followUpsDue: 9,
    replies: 7,
    blocked: 3,
    completed: 12,
    owner: "Maya Chen",
    lastActivity: "12 min ago",
    deadline: "Jun 28",
    channel: "Email + LinkedIn",
    summary: {
      situation: "The campaign is warm: several CFOs engaged with the ROI angle, but replies cluster around procurement timing.",
      progress: "27 of 42 targets have received at least one touch. Follow-up 2 is the highest leverage step today.",
      blockers: "Three targets lack a verified source link and two accounts need a softer compliance-safe message.",
      nextPriorities: ["Send 9 due follow-ups", "Review 3 blocked source gaps", "Personalize the CFO break-up template"],
      health: "Healthy, but momentum depends on clearing today's follow-up queue.",
    },
  },
  {
    id: "design-leads",
    name: "Senior design lead search",
    type: "Recruiting",
    goal: "Move senior product design candidates from first contact to intro call.",
    status: "Review",
    targets: 18,
    progress: 48,
    followUpsDue: 4,
    replies: 5,
    blocked: 1,
    completed: 3,
    owner: "Noah Patel",
    lastActivity: "1 hr ago",
    deadline: "Jul 05",
    channel: "Email",
    summary: {
      situation: "The role narrative is resonating with portfolio-led candidates, but compensation questions need a prepared answer.",
      progress: "Nine candidates are active and five replied. Two candidates are ready for scheduling.",
      blockers: "One candidate needs hiring manager context before the next message.",
      nextPriorities: ["Copy the manager context into the playbook", "Send candidate reminder messages", "Mark two scheduling replies handled"],
      health: "Good. The campaign needs human review before the next batch.",
    },
  },
  {
    id: "acme-docs",
    name: "ACME onboarding documents",
    type: "Client documents",
    goal: "Collect signed vendor forms, SOC2 confirmation, and billing details from client stakeholders.",
    status: "Waiting",
    targets: 11,
    progress: 72,
    followUpsDue: 6,
    replies: 2,
    blocked: 2,
    completed: 7,
    owner: "Ella Torres",
    lastActivity: "Yesterday",
    deadline: "Jun 18",
    channel: "Email",
    summary: {
      situation: "Most required documents are in place. The open work is concentrated around billing and security contacts.",
      progress: "Seven targets are complete, two are waiting, and two need escalation.",
      blockers: "Security questionnaire ownership is unclear and finance has not confirmed the invoice address.",
      nextPriorities: ["Escalate security contact", "Send finance reminder", "Attach Drive folder link to missing source"],
      health: "At risk only if the two escalations stay unresolved.",
    },
  },
  {
    id: "vendor-renewals",
    name: "Vendor renewal checks",
    type: "Vendor follow-up",
    goal: "Confirm renewal terms, missing invoices, and owner approvals before month end.",
    status: "Blocked",
    targets: 16,
    progress: 39,
    followUpsDue: 2,
    replies: 1,
    blocked: 5,
    completed: 4,
    owner: "Sam Rivera",
    lastActivity: "2 days ago",
    deadline: "Jun 30",
    channel: "Email + Slack",
    summary: {
      situation: "Vendor owners are spread across teams and several source links are missing.",
      progress: "Four vendors are resolved. Five need internal owner confirmation before follow-up.",
      blockers: "Missing purchase orders and unclear approvers are slowing the queue.",
      nextPriorities: ["Assign internal owners", "Collect missing PO links", "Snooze vendors awaiting legal"],
      health: "Blocked until ownership data is cleaned up.",
    },
  },
];

export const targets: Target[] = [
  {
    id: "t-amelia",
    campaignId: "northstar-q3",
    name: "Amelia Brooks",
    company: "Ferro Labs",
    role: "VP Finance",
    email: "amelia@ferrolabs.example",
    note: "Mention audit prep and revenue leak dashboard.",
    status: "Contacted",
    currentStep: "Follow-up 1",
    priority: "High",
    lastAction: "Initial email sent Jun 8",
    nextAction: "Send concise ROI follow-up",
    due: "Today",
    sourceCount: 4,
    summary: {
      who: "Finance leader at a fast-growing infrastructure SaaS company.",
      why: "Matches the campaign's ICP and recently hired a RevOps manager.",
      happened: "Received initial message and viewed the source deck.",
      blocker: "No reply yet; finance value prop needs to be sharpened.",
      next: "Send a short follow-up anchored on month-end reporting pressure.",
      sources: ["LinkedIn profile", "Company funding note", "Source deck", "CRM record"],
    },
  },
  {
    id: "t-jon",
    campaignId: "northstar-q3",
    name: "Jon Bell",
    company: "Ledgerly",
    role: "CFO",
    email: "jon@ledgerly.example",
    note: "Asked about implementation lift.",
    status: "Replied",
    currentStep: "Reply handling",
    priority: "High",
    lastAction: "Reply received this morning",
    nextAction: "Draft answer and suggest 20 min call",
    due: "Today",
    sourceCount: 5,
    summary: {
      who: "CFO at Ledgerly, responsible for FP&A and billing operations.",
      why: "Strong fit for pipeline workflow automation.",
      happened: "Asked for implementation details after the first follow-up.",
      blocker: "Needs reassurance on setup time.",
      next: "Copy the implementation answer and propose two meeting windows.",
      sources: ["Email thread", "CRM record", "Implementation note"],
    },
  },
  {
    id: "t-lina",
    campaignId: "northstar-q3",
    name: "Lina Ortega",
    company: "Orbit Desk",
    role: "Head of Revenue",
    email: "lina@orbitdesk.example",
    note: "No LinkedIn source found yet.",
    status: "Blocked",
    currentStep: "Source review",
    priority: "Medium",
    lastAction: "Source check failed",
    nextAction: "Add source link before next touch",
    due: "Tomorrow",
    sourceCount: 1,
    summary: {
      who: "Revenue leader at a customer support platform.",
      why: "Likely owns handoff quality between sales and finance.",
      happened: "Imported from CSV but enrichment is incomplete.",
      blocker: "Needs a credible source link to personalize safely.",
      next: "Add a public profile or company page before copying the message.",
      sources: ["CSV import"],
    },
  },
  {
    id: "t-priya",
    campaignId: "design-leads",
    name: "Priya Shah",
    company: "Northwind",
    role: "Principal Product Designer",
    email: "priya@northwind.example",
    note: "Portfolio has strong AI workflow projects.",
    status: "Replied",
    currentStep: "Schedule screen",
    priority: "High",
    lastAction: "Candidate replied Jun 9",
    nextAction: "Send interview windows",
    due: "Today",
    sourceCount: 6,
    summary: {
      who: "Principal designer with AI workspace experience.",
      why: "Directly aligned with the open senior design lead role.",
      happened: "Positive reply, asked about team composition.",
      blocker: "Needs a crisp hiring-manager answer.",
      next: "Copy the scheduling message and include team context.",
      sources: ["Portfolio", "LinkedIn profile", "Email thread", "Role brief"],
    },
  },
  {
    id: "t-marcus",
    campaignId: "acme-docs",
    name: "Marcus Lee",
    company: "ACME",
    role: "Security lead",
    email: "marcus@acme.example",
    note: "Owns SOC2 confirmation.",
    status: "Snoozed",
    currentStep: "Urgent reminder",
    priority: "Medium",
    lastAction: "Reminder sent yesterday",
    nextAction: "Escalate with client sponsor if no reply",
    due: "Tomorrow",
    sourceCount: 3,
    summary: {
      who: "Security owner for the ACME onboarding package.",
      why: "Required for the campaign's document completion goal.",
      happened: "Received two reminders; no confirmation yet.",
      blocker: "May need sponsor visibility.",
      next: "Escalate politely with the sponsor copied if still quiet.",
      sources: ["Drive folder", "Security checklist", "Email thread"],
    },
  },
];

export const playbookStages: PlaybookStage[] = [
  {
    id: "p1",
    campaignId: "northstar-q3",
    title: "Initial outreach",
    delay: "Day 0",
    status: "Ready",
    condition: "Send once target has at least two sources.",
    message: "Hi {{firstName}}, noticed {{company}} is scaling finance ops. Worth comparing notes on reducing follow-up drift before month end?",
  },
  {
    id: "p2",
    campaignId: "northstar-q3",
    title: "Follow-up 1",
    delay: "2 business days",
    status: "Editable",
    condition: "Use if there is no reply and target is not blocked.",
    message: "Quick nudge, {{firstName}}. Teams like yours usually lose context between CRM notes, spreadsheets, and inbox follow-ups. Is this worth a short look?",
  },
  {
    id: "p3",
    campaignId: "northstar-q3",
    title: "Follow-up 2",
    delay: "4 business days",
    status: "Conditional",
    condition: "Switch to softer value proof if source confidence is medium.",
    message: "Sharing one concrete angle: a campaign cockpit can make every next action visible without asking reps to live in another tool.",
  },
  {
    id: "p4",
    campaignId: "northstar-q3",
    title: "Break-up",
    delay: "7 business days",
    status: "Ready",
    condition: "Stop sequence after this step unless target replies.",
    message: "I will close the loop for now. If follow-up visibility becomes a priority later, happy to send the short workflow.",
  },
  {
    id: "p5",
    campaignId: "design-leads",
    title: "Candidate intro",
    delay: "Day 0",
    status: "Ready",
    condition: "Personalize with portfolio note.",
    message: "Hi {{firstName}}, your work on workflow-heavy products stood out. We are opening a senior design lead role that might map well to your background.",
  },
  {
    id: "p6",
    campaignId: "acme-docs",
    title: "Document reminder",
    delay: "2 business days",
    status: "Conditional",
    condition: "Escalate after urgent reminder if required document remains missing.",
    message: "Hi {{firstName}}, quick reminder that we still need {{missingDocument}} to keep onboarding on track for {{deadline}}.",
  },
];

export const followUps: FollowUp[] = [
  {
    id: "f1",
    campaignId: "northstar-q3",
    targetId: "t-amelia",
    dueDate: "Today 10:00",
    campaign: "Northstar Q3 pipeline",
    target: "Amelia Brooks",
    reason: "No reply after initial outreach",
    step: "Follow-up 1",
    priority: "High",
    message: "Quick nudge, Amelia. Teams like Ferro Labs usually lose context between CRM notes, spreadsheets, and inbox follow-ups. Is this worth a short look?",
  },
  {
    id: "f2",
    campaignId: "northstar-q3",
    targetId: "t-jon",
    dueDate: "Today 11:30",
    campaign: "Northstar Q3 pipeline",
    target: "Jon Bell",
    reason: "Reply needs human response",
    step: "Reply handling",
    priority: "High",
    message: "Thanks Jon. Setup is usually a focused import plus one playbook review. Want me to send a 20 minute walkthrough for Tuesday or Wednesday?",
  },
  {
    id: "f3",
    campaignId: "design-leads",
    targetId: "t-priya",
    dueDate: "Today 14:00",
    campaign: "Senior design lead search",
    target: "Priya Shah",
    reason: "Candidate asked for team context",
    step: "Schedule screen",
    priority: "High",
    message: "Happy to share more context. The design lead will partner with product, AI engineering, and GTM on one workflow surface. Are you open to a first conversation this week?",
  },
  {
    id: "f4",
    campaignId: "acme-docs",
    targetId: "t-marcus",
    dueDate: "Tomorrow 09:00",
    campaign: "ACME onboarding documents",
    target: "Marcus Lee",
    reason: "SOC2 confirmation still missing",
    step: "Urgent reminder",
    priority: "Medium",
    message: "Hi Marcus, checking again on the SOC2 confirmation. If someone else owns this, could you point me to the right person so we can keep onboarding moving?",
  },
];

export const dataSources: DataSource[] = [
  {
    id: "d1",
    title: "Ferro Labs finance profile",
    type: "LinkedIn profile",
    url: "https://example.com/ferro-finance",
    campaignId: "northstar-q3",
    targetId: "t-amelia",
    linkedCampaign: "Northstar Q3 pipeline",
    linkedTarget: "Amelia Brooks",
    description: "Public profile used for title and team-size personalization.",
    importance: "High",
    lastChecked: "Today",
  },
  {
    id: "d2",
    title: "Ledgerly implementation reply",
    type: "Email thread",
    url: "https://example.com/email-ledgerly",
    campaignId: "northstar-q3",
    targetId: "t-jon",
    linkedCampaign: "Northstar Q3 pipeline",
    linkedTarget: "Jon Bell",
    description: "Reply asking about implementation lift and next steps.",
    importance: "High",
    lastChecked: "Today",
  },
  {
    id: "d3",
    title: "Candidate role brief",
    type: "Document",
    url: "https://example.com/role-brief",
    campaignId: "design-leads",
    targetId: "t-priya",
    linkedCampaign: "Senior design lead search",
    linkedTarget: "Priya Shah",
    description: "Hiring-manager notes and team context for candidate messaging.",
    importance: "High",
    lastChecked: "Yesterday",
  },
  {
    id: "d4",
    title: "ACME onboarding folder",
    type: "Drive folder",
    url: "https://example.com/acme-folder",
    campaignId: "acme-docs",
    linkedCampaign: "ACME onboarding documents",
    description: "Campaign-level folder with contract, invoice, and security documents.",
    importance: "Medium",
    lastChecked: "Yesterday",
  },
  {
    id: "d5",
    title: "Orbit Desk source link",
    type: "Missing source",
    url: "#",
    campaignId: "northstar-q3",
    targetId: "t-lina",
    linkedCampaign: "Northstar Q3 pipeline",
    linkedTarget: "Lina Ortega",
    description: "Needed before the next message can be safely personalized.",
    importance: "Medium",
    lastChecked: "Not checked",
    missing: true,
  },
];

export const templates: Template[] = [
  {
    id: "tpl-prospecting",
    category: "Prospecting",
    title: "Manual outbound with break-up",
    description: "Initial, two value nudges, and a respectful close-the-loop message.",
    steps: ["Initial", "Follow-up 1", "Follow-up 2", "Break-up"],
  },
  {
    id: "tpl-recruiting",
    category: "Recruiting",
    title: "Candidate first-touch to screen",
    description: "Personalized outreach, role context, reminder, and scheduling reply.",
    steps: ["Intro", "Portfolio note", "Reminder", "Schedule"],
  },
  {
    id: "tpl-hr",
    category: "HR request",
    title: "Internal request escalation",
    description: "Request, reminder, urgent reminder, and manager copy condition.",
    steps: ["Request", "Reminder", "Urgent", "Escalate"],
  },
  {
    id: "tpl-invoice",
    category: "Invoice follow-up",
    title: "Finance-friendly invoice follow-up",
    description: "Polite reminders with proof, due date, and owner routing.",
    steps: ["Confirm owner", "Reminder", "Final notice", "Stop"],
  },
  {
    id: "tpl-client",
    category: "Client documents",
    title: "Client document collection",
    description: "Collect missing assets while keeping sponsor visibility clear.",
    steps: ["Request", "Checklist", "Urgent reminder", "Sponsor copy"],
  },
  {
    id: "tpl-vendor",
    category: "Vendor follow-up",
    title: "Vendor renewal coordination",
    description: "Track terms, owner approvals, invoices, and legal handoffs.",
    steps: ["Owner confirm", "Vendor ask", "Approval", "Complete"],
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "a1",
    campaignId: "northstar-q3",
    targetId: "t-jon",
    title: "Reply received",
    description: "Jon asked whether implementation requires CRM admin time.",
    time: "Today 08:42",
  },
  {
    id: "a2",
    campaignId: "northstar-q3",
    targetId: "t-amelia",
    title: "Follow-up due",
    description: "Follow-up 1 moved into the high-priority queue.",
    time: "Today 07:15",
  },
  {
    id: "a3",
    campaignId: "design-leads",
    targetId: "t-priya",
    title: "Candidate source added",
    description: "Portfolio link attached to Priya Shah.",
    time: "Yesterday 16:30",
  },
  {
    id: "a4",
    campaignId: "acme-docs",
    targetId: "t-marcus",
    title: "Reminder marked sent",
    description: "Security document reminder was manually sent.",
    time: "Yesterday 10:04",
  },
];

export const dashboardStats = [
  { label: "Active campaigns", value: "4", detail: "2 need action today", tone: "text-emerald-700" },
  { label: "Follow-ups due today", value: "19", detail: "9 high priority", tone: "text-violet-700" },
  { label: "Replies to handle", value: "8", detail: "3 are ready to schedule", tone: "text-blue-700" },
  { label: "Blocked targets", value: "11", detail: "Mostly missing sources", tone: "text-amber-700" },
  { label: "Need review", value: "3", detail: "Playbooks awaiting edit", tone: "text-rose-700" },
];

export const recentUpdates = [
  "Ledgerly replied with implementation questions.",
  "ACME security source was marked missing.",
  "Senior design lead playbook needs compensation context.",
  "Vendor renewal checks has five owner gaps.",
];

export const settingsSections = [
  {
    title: "Profile",
    items: ["Name: Maya Chen", "Workspace: Revenue Ops", "Default owner: You"],
  },
  {
    title: "Campaign types",
    items: ["Prospecting", "Recruiting", "Client documents", "Invoice follow-up"],
  },
  {
    title: "Default follow-up delays",
    items: ["Follow-up 1: 2 business days", "Follow-up 2: 4 business days", "Final: 7 business days"],
  },
  {
    title: "AI preferences",
    items: ["Tone: concise and helpful", "Personalization: source-backed", "Never imply automatic sending"],
  },
  {
    title: "Notifications",
    items: ["Daily briefing: on", "Due follow-ups: on", "Blocked targets: weekly digest"],
  },
];

export function getCampaign(id: string) {
  return campaigns.find((campaign) => campaign.id === id) ?? campaigns[0];
}

export function getTargetsForCampaign(campaignId: string) {
  return targets.filter((target) => target.campaignId === campaignId);
}

export function getTarget(targetId: string) {
  return targets.find((target) => target.id === targetId) ?? targets[0];
}

export function getPlaybook(campaignId: string) {
  return playbookStages.filter((stage) => stage.campaignId === campaignId);
}

export function getSourcesForCampaign(campaignId: string) {
  return dataSources.filter((source) => source.campaignId === campaignId);
}

export function getSourcesForTarget(targetId: string) {
  return dataSources.filter((source) => source.targetId === targetId);
}

export const emptyStateExamples = [
  { icon: Building2, title: "Paste a target list", description: "Name, company, role, email, note, and source link." },
  { icon: FileCheck2, title: "Attach source links", description: "Keep campaign and target context next to each person." },
  { icon: Inbox, title: "Copy next messages", description: "The MVP keeps the user in control of every send." },
];

