import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  Layers3,
  Mail,
  MousePointer2,
  Plus,
  Save,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react";

const followUpApps = [
  { name: "LinkedIn", logo: "/logos/linkedin.svg", logoClassName: "size-7" },
  { name: "Gmail", logo: "/logos/gmail.svg", logoClassName: "size-7" },
  { name: "Slack", logo: "/logos/slack.svg", logoClassName: "size-7" },
  { name: "Outlook", logo: "/logos/outlook.svg", logoClassName: "size-8" },
  { name: "WhatsApp", logo: "/logos/whatsapp.svg", logoClassName: "size-7" },
  { name: "Teams", logo: "/logos/teams.svg", logoClassName: "size-8" },
];

const memoryCards = [
  {
    title: "HR",
    text: "Centralize employee follow-ups, onboarding tasks and internal requests before they get lost.",
    visual: "hr",
  },
  {
    title: "Commercial",
    text: "Keep warm opportunities moving with clear next steps, source-backed context and timely reminders.",
    visual: "commercial",
  },
  {
    title: "Recruiter",
    text: "Track candidate conversations, interview loops and hiring follow-ups from one reviewed queue.",
    visual: "recruiter",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf9ff] text-[#332252]">
      <Navbar />

      <section className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col justify-start px-4 pb-24 pt-36 sm:px-8 lg:pt-44">
        <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="w-full shrink-0 text-left lg:w-[35%]">
            <h1 className="animate-fade-up delay-150 max-w-xl text-3xl font-medium leading-[1.15] tracking-tight text-[#332252] sm:text-4xl lg:text-5xl">
              Every follow-up. <span className="font-bold">Instantly coordinated.</span>
            </h1>
            <p className="animate-fade-up delay-300 mt-8 max-w-xl text-lg leading-relaxed text-[#332252]/65">
              Turn campaign goals, target history and scattered sources into one clear queue for your team.
            </p>

            <div className="animate-fade-up delay-500 mt-9 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-start">
              <Link
                href="/app/dashboard"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98]"
              >
                <span aria-hidden="true" className="animate-shimmer pointer-events-none absolute inset-0" />
                Open the app
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/15 bg-white px-7 py-3.5 text-sm font-semibold text-violet-900/75 shadow-sm shadow-violet-900/5 transition-all hover:bg-violet-50 hover:text-violet-900"
              >
                See the workflow
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[65%] lg:-mt-10 xl:-mt-14">
            <HeroDemo />
          </div>
        </div>

        <div className="animate-fade-up delay-900 mt-24 flex w-full flex-col items-center overflow-hidden px-4">
          <p className="mb-8 text-center text-sm font-medium text-[#332252]/55">
            Follow-ups disappear inside the apps your team already uses.
          </p>
          <div className="grid w-full max-w-4xl grid-cols-3 gap-3 sm:grid-cols-6">
            {followUpApps.map((app) => (
              <div
                key={app.name}
                className="group flex min-w-0 flex-col items-center rounded-2xl border border-violet-500/12 bg-white p-4 text-center shadow-lg shadow-violet-900/5 transition-all hover:-translate-y-1 hover:border-violet-500/25 hover:shadow-violet-900/10"
              >
                <span className="mb-3 grid size-12 place-items-center rounded-xl border border-violet-500/12 bg-white shadow-sm shadow-violet-900/5">
                  <Image
                    src={app.logo}
                    alt={`${app.name} logo`}
                    width={32}
                    height={32}
                    className={app.logoClassName}
                  />
                </span>
                <p className="truncate text-sm font-bold text-[#332252]">{app.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section id="how-it-works" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-[#fbf9ff]" />
        <div className="absolute inset-0 bg-grid" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 max-w-3xl">
            <h2 className="mb-5 text-3xl font-medium tracking-tight text-[#332252] sm:text-4xl">
              Campaign work, brought into one rhythm.
            </h2>
            <p className="text-lg leading-relaxed text-[#332252]/60">
              FollowPilot gives every campaign a command center, a source trail and a controlled execution loop.
            </p>
          </div>

          <FeatureBlock
            title="Queue"
            text="See who needs attention today, why they are blocked, and which action is safe to take next."
            cta="Run the daily queue"
            reverse
          >
            <ProductImageDemo
              src="/product/followup-command-violet.png"
              alt="FollowPilot follow-up command queue with large violet product cards"
            />
          </FeatureBlock>

          <FeatureBlock
            title="Sources & references"
            text="Keep every draft connected to the CRM note, reply, document or target detail that justifies it."
            cta="Keep context attached"
          >
            <ProductImageDemo
              src="/product/source-coverage-feature-violet.png"
              alt="FollowPilot source coverage product visual with large chart and source-backed follow-up suggestion"
            />
          </FeatureBlock>

          <FeatureBlock
            title="AI playbooks"
            text="Generate campaign steps from your goal, then review the rules before a single follow-up goes out."
            cta="Shape the playbook"
            reverse
          >
            <ProductImageDemo
              src="/product/sequence-feature-violet.png"
              alt="FollowPilot AI playbook builder product visual with visible sequence cards"
            />
          </FeatureBlock>

          <div id="use-cases" className="mb-10 mt-28 w-full scroll-mt-28 text-left">
            <SectionDivider className="mb-20" />
            <h2 className="text-2xl font-medium tracking-tight text-[#332252]">Use cases</h2>
          </div>

          <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
            {memoryCards.map((card) => (
              <MemoryCard key={card.title} card={card} />
            ))}
          </div>

        </div>
      </section>

      <SectionDivider />

      <section id="pricing" className="relative overflow-hidden bg-white px-4 py-28 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_34%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-[#332252] sm:text-5xl">Pricing</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#332252]/60">
              Store context, conversations and follow-up history so you always know where every relationship stands.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.08fr]">
            <div className="rounded-[2rem] border border-[#332252]/10 bg-white p-7 shadow-xl shadow-violet-900/5">
              <div className="mb-6">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Before
                </span>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#332252]">Manual follow-ups</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#332252]/60">
                  Follow-ups depend on memory, scattered notes and manually checking old conversations.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  ["Follow-ups forgotten", "Important replies disappear after a busy day"],
                  ["Context scattered", "Notes, CRM fields and messages live in separate tabs"],
                  ["Discussion history lost", "You have to reread threads to know where things stand"],
                  ["Next step unclear", "No reliable view of who needs attention and why"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-[#332252]">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#332252]/55">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/20 bg-[#1f143d] p-7 text-white shadow-2xl shadow-violet-900/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.45),transparent_34%)]" />
              <div className="relative">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-violet-100">
                      After
                    </span>
                    <h3 className="mt-5 text-2xl font-bold tracking-tight">Solo</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      One follow-up command center that stores your context and discussions so the next action is always clear.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-bold text-white">
                    14 days free
                  </span>
                </div>

                <div className="mb-6 rounded-3xl border border-white/10 bg-white/10 p-5">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold tracking-tight">$29.99</span>
                    <span className="pb-2 text-sm font-medium text-white/55">/ month</span>
                  </div>
                  <p className="mt-3 rounded-2xl bg-emerald-400/12 px-4 py-3 text-sm font-semibold text-emerald-100">
                    14-day free trial, no card required.
                  </p>
                </div>

                <div className="mb-6 space-y-3">
                  {[
                    "Unified queue for every important follow-up across your tools",
                    "Stored conversation history so you always know where things stand",
                    "Campaign context saved with notes, sources, decisions and next steps",
                    "AI drafts grounded in the full context of each discussion",
                    "Daily next-action list showing who needs attention and why",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-relaxed text-white/82">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/app/campaigns/new"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/25 transition-colors hover:bg-violet-400"
                >
                  Start free trial
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex w-full flex-col items-center justify-center px-4 pb-40 pt-20 text-center">
        <h2 className="mx-auto mb-10 max-w-5xl text-5xl font-medium leading-[1.05] tracking-tight text-[#332252] sm:text-7xl lg:text-[88px]">
          Know the next action.<br />Move the campaign forward.
        </h2>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#332252]/55">
          Open the command center, inspect the queue and turn messy campaign context into reviewed follow-ups.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/app/dashboard"
            className="group inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-[15px] font-medium text-white transition-all hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98]"
          >
            Open demo workspace
            <MousePointer2 className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/app/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-white px-7 py-3 text-[15px] font-medium text-violet-900/75 transition-colors hover:bg-violet-50 hover:text-violet-900"
          >
            Start a campaign
          </Link>
        </div>
      </section>
    </main>
  );
}

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-violet-500/15 bg-[#fbf9ff]/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 py-3 sm:min-h-20 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight text-[#332252]/90 transition-colors hover:text-[#332252]">
          <span className="grid size-8 place-items-center text-violet-600">
            <LeafLogo className="size-8" />
          </span>
          verytis
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#332252]/45 sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-[#332252]/80">Product</a>
          <a href="#how-it-works" className="transition-colors hover:text-[#332252]/80">Workflow</a>
          <a href="#use-cases" className="transition-colors hover:text-[#332252]/80">Use cases</a>
          <a href="#pricing" className="transition-colors hover:text-[#332252]/80">Pricing</a>
        </nav>
        <Link
          href="/app/campaigns/new"
          className="rounded-xl border border-violet-500/15 bg-white px-4 py-2 text-sm font-medium text-violet-900/80 transition-colors hover:bg-violet-50 hover:text-violet-900"
        >
          Start
        </Link>
      </div>
    </header>
  );
}

function LeafLogo({ className }: { className?: string }) {
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

function HeroDemo() {
  return (
    <div className="animate-fade-up delay-700 relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_85%_82%,rgba(216,180,254,0.75),transparent_28%),linear-gradient(135deg,#8b5cf6_0%,#6d45d8_48%,#4c2aa5_100%)] p-5 shadow-2xl shadow-violet-700/20 sm:p-8">
      <div className="absolute inset-0 bg-grid opacity-35" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-[120%] rounded-[100%] border border-white/25" />

      <aside className="relative mb-6 max-w-sm text-white lg:absolute lg:left-9 lg:top-24 lg:mb-0 lg:w-[300px] xl:w-[340px]">
        <span className="mb-5 inline-flex rounded-full bg-white/18 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
          Campaign setup
        </span>
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl xl:text-[2rem]">
          Launch campaigns with the right context.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-white/80">
          Define the goal, audience and sources before the queue starts moving.
        </p>
        <div className="mt-7 space-y-3">
          {[
            ["Goal-first", Target],
            ["Target audience", Users],
            ["Source coverage", Layers3],
          ].map(([label, Icon]) => (
            <div key={label as string} className="flex items-center gap-3 text-sm font-medium text-white/90">
              <span className="grid size-10 place-items-center rounded-xl bg-white/16 shadow-lg shadow-violet-950/15">
                <Icon className="size-5" />
              </span>
              {label as string}
            </div>
          ))}
        </div>
      </aside>

      <div className="relative mx-auto w-full max-w-[720px] lg:ml-[46%] lg:max-w-[640px] xl:ml-[42%] xl:max-w-[700px]">
        <div className="overflow-hidden rounded-[1.45rem] border border-white/55 bg-white/95 shadow-2xl shadow-violet-950/25 backdrop-blur">
          <div className="flex h-12 items-center border-b border-violet-100 bg-white px-5">
            <div className="flex gap-2">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-amber-400" />
              <span className="size-3 rounded-full bg-emerald-500" />
            </div>
            <button className="ml-auto inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800">
              <Save className="size-3.5" />
              Save draft
            </button>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-7 flex items-center justify-center gap-2 overflow-hidden text-xs text-violet-500">
              {["Campaign", "Sequence", "Rules", "Review"].map((step, index) => (
                <div key={step} className="flex min-w-0 items-center gap-2">
                  <span className={`grid size-7 place-items-center rounded-full border text-xs font-bold ${index === 0 ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-violet-400"}`}>
                    {index + 1}
                  </span>
                  <span className="hidden truncate sm:inline">{step}</span>
                  {index < 3 ? <span className="hidden h-px w-8 bg-violet-200 sm:block" /> : null}
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-[#332252]">Campaign setup</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#332252]/55">Build a strong foundation for your outreach.</p>

            <div className="mt-5 space-y-4">
              <SetupCard icon={<Flag className="size-5" />} title="What's the main goal?" status="Clear goal" tone="green">
                <div className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm text-[#332252]/75">Book qualified meetings</div>
              </SetupCard>
              <SetupCard icon={<Users className="size-5" />} title="Who are you targeting?" status="Audience ready" tone="violet">
                <div className="flex flex-wrap gap-2">
                  {["VP Sales", "SaaS"].map((tag) => (
                    <span key={tag} className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-medium text-[#332252]/75">{tag}</span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-lg border border-dashed border-violet-200 px-3 py-2 text-xs font-medium text-violet-700">
                    <Plus className="size-3.5" />
                    Add filter
                  </span>
                </div>
              </SetupCard>
              <SetupCard icon={<Mail className="size-5" />} title="What sources should AI use?" status="2 missing" tone="orange">
                <div className="flex flex-wrap gap-2">
                  {["CRM", "LinkedIn", "Email threads"].map((tag) => (
                    <span key={tag} className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-medium text-[#332252]/75">{tag}</span>
                  ))}
                </div>
              </SetupCard>
              <SetupCard icon={<Sparkles className="size-5" />} title="Additional context" status="Optional" tone="violet">
                <div className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm text-[#332252]/35">Add notes, links or anything AI should know...</div>
              </SetupCard>
            </div>

            <div className="mt-5 flex justify-between">
              <button className="rounded-lg border border-violet-100 px-5 py-2 text-sm font-semibold text-[#332252]/70">Back</button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20">
                Continue
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/20 bg-white/16 text-white shadow-xl shadow-violet-950/10 backdrop-blur">
          {[
            ["1,250", "Targets"],
            ["87%", "Coverage"],
            ["10:00", "Best time"],
          ].map(([value, label]) => (
            <div key={label} className="border-r border-white/15 px-4 py-3 last:border-r-0">
              <p className="font-bold">{value}</p>
              <p className="text-xs text-white/75">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:absolute lg:right-5 lg:top-24 lg:mt-0 lg:w-52 lg:grid-cols-1 xl:right-7">
        <FloatingPanel title="Campaign overview" icon={<Target className="size-4" />}>
          {[
            ["Goal", "Meetings"],
            ["Audience", "1,250 targets"],
            ["Sources", "3 connected"],
            ["Progress", "75%"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-violet-100 py-2 text-xs last:border-b-0">
              <span className="text-[#332252]/60">{label}</span>
              <span className="truncate text-right font-semibold text-violet-700">{value}</span>
            </div>
          ))}
        </FloatingPanel>
        <FloatingPanel title="AI will generate" icon={<Wand2 className="size-4" />}>
          {["Personalized angles", "Message drafts", "Follow-up steps"].map((item) => (
            <div key={item} className="flex items-center justify-between gap-2 py-1.5 text-xs text-[#332252]/70">
              <span className="truncate">{item}</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
          ))}
        </FloatingPanel>
      </div>
    </div>
  );
}

function SetupCard({
  icon,
  title,
  status,
  tone,
  children,
}: {
  icon: ReactNode;
  title: string;
  status: string;
  tone: "green" | "orange" | "violet";
  children: ReactNode;
}) {
  const statusClassName = {
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    violet: "bg-violet-50 text-violet-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-lg shadow-violet-900/5">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-bold text-[#332252]">{title}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClassName}`}>{status}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function FloatingPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <div className="mb-3 flex items-center gap-2 font-bold text-[#332252]">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">{icon}</span>
        <span className="min-w-0 truncate text-sm">{title}</span>
      </div>
      {children}
    </div>
  );
}

function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto h-px max-w-5xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-beam h-full w-1/3 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      </div>
    </div>
  );
}

function FeatureBlock({
  title,
  text,
  cta,
  children,
  reverse = false,
}: {
  title: string;
  text: string;
  cta: string;
  children: ReactNode;
  reverse?: boolean;
}) {
  return (
    <article className="mb-16 flex flex-col items-stretch overflow-hidden rounded-[2rem] border border-violet-500/15 bg-white shadow-xl shadow-violet-900/5 lg:mb-24 lg:flex-row">
      <div className={`flex w-full flex-col justify-center p-8 sm:p-10 lg:w-1/3 lg:p-12 ${reverse ? "lg:order-2" : ""}`}>
        <h3 className="mb-4 text-2xl font-semibold tracking-tight text-[#332252]">{title}</h3>
        <p className="mb-6 text-lg leading-relaxed text-[#332252]/60">{text}</p>
        <a href="#how-it-works" className="inline-flex items-center text-sm font-medium text-violet-800/75 transition-colors hover:text-violet-900">
          {cta} <ArrowRight className="ml-1 size-3.5" />
        </a>
      </div>
      <div className={`flex w-full flex-col justify-center border-t border-violet-500/15 bg-violet-50/40 p-4 sm:p-6 lg:w-2/3 lg:border-t-0 lg:p-8 ${reverse ? "lg:order-1 lg:border-r" : "lg:border-l"}`}>
        {children}
      </div>
    </article>
  );
}

function ProductImageDemo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[1.65rem] border border-violet-500/15 bg-white p-2 shadow-2xl shadow-violet-900/10">
      <Image
        src={src}
        alt={alt}
        width={1536}
        height={1024}
        className="block h-auto w-full rounded-[1.35rem]"
        sizes="(min-width: 1024px) 760px, 100vw"
      />
    </div>
  );
}

function MemoryCard({ card }: { card: (typeof memoryCards)[number] }) {
  return (
    <article className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-violet-500/15 bg-white shadow-lg shadow-violet-900/5 transition-colors hover:bg-violet-50/30">
      <div className="relative z-10 p-6 pb-0 lg:p-8">
        <h3 className="mb-3 text-lg font-semibold tracking-tight text-[#332252]">{card.title}</h3>
        <p className="text-sm leading-relaxed text-[#332252]/60">{card.text}</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-8 pt-8">
        {card.visual === "hr" ? <UseCaseModal type="hr" /> : null}
        {card.visual === "commercial" ? <UseCaseModal type="commercial" /> : null}
        {card.visual === "recruiter" ? <UseCaseModal type="recruiter" /> : null}
      </div>
    </article>
  );
}

function UseCaseModal({ type }: { type: "hr" | "commercial" | "recruiter" }) {
  const content = {
    hr: {
      eyebrow: "People ops",
      title: "HR follow-up queue",
      accent: "bg-emerald-500",
      icon: Users,
      rows: [
        ["Onboarding", "3 tasks due"],
        ["Manager request", "Needs owner"],
        ["Policy update", "Ready to send"],
      ],
    },
    commercial: {
      eyebrow: "Revenue",
      title: "Deal next steps",
      accent: "bg-violet-600",
      icon: Target,
      rows: [
        ["Warm lead", "Reply today"],
        ["Proposal", "Source attached"],
        ["Renewal", "Decision pending"],
      ],
    },
    recruiter: {
      eyebrow: "Hiring",
      title: "Candidate pipeline",
      accent: "bg-sky-500",
      icon: ClipboardCheck,
      rows: [
        ["Interview loop", "2 follow-ups"],
        ["Offer stage", "Approval needed"],
        ["Talent pool", "Nurture draft"],
      ],
    },
  }[type];
  const Icon = content.icon;

  return (
    <div className="w-full max-w-[300px] rotate-[-1deg] overflow-hidden rounded-2xl border border-violet-500/15 bg-white shadow-2xl shadow-violet-900/10">
      <div className="flex h-10 items-center border-b border-violet-100 bg-violet-50/70 px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className={`grid size-10 place-items-center rounded-xl text-white ${content.accent}`}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700/60">{content.eyebrow}</p>
            <h3 className="truncate text-sm font-bold text-[#332252]">{content.title}</h3>
          </div>
        </div>
        <div className="space-y-2">
          {content.rows.map(([label, status]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-[#fbf9ff] px-3 py-2">
              <span className="truncate text-xs font-semibold text-[#332252]">{label}</span>
              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-violet-700 shadow-sm shadow-violet-900/5">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
