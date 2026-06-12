"use client";

import * as React from "react";
import { CreditCard, Save, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const settingsTabs = ["Account", "Security", "Billing"] as const;

type SettingsTab = (typeof settingsTabs)[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("Account");

  return (
    <div className="-mx-6 -mt-6 min-h-[calc(100vh-4rem)] bg-[#f7f8fb] px-6 pb-10 pt-0">
      <div className="sticky top-0 z-10 -mx-6 border-b border-neutral-200 bg-white px-6">
        <div className="flex h-12 items-center gap-6 overflow-x-auto">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative h-full whitespace-nowrap text-sm font-medium text-neutral-400 transition hover:text-neutral-900",
                activeTab === tab && "text-neutral-950",
              )}
            >
              {tab}
              {activeTab === tab ? <span className="absolute inset-x-0 bottom-0 h-px bg-neutral-950" /> : null}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto mt-8 max-w-6xl">
        {activeTab === "Account" ? <AccountSettings /> : null}
        {activeTab === "Security" ? <SecuritySettings /> : null}
        {activeTab === "Billing" ? <BillingSettings /> : null}
      </main>
    </div>
  );
}

function AccountSettings() {
  return (
    <SettingsCard
      icon={<UserRound className="h-5 w-5" />}
      title="Account Settings"
      description="Manage your personal account information and preferences"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First Name"><Input defaultValue="Vini-Vidi" /></Field>
        <Field label="Last Name"><Input placeholder="Enter your last name" /></Field>
      </div>

      <div className="mt-6 grid max-w-xs gap-5">
        <Field label="Preferred Language" hint="This language preference will be used for AI message generation">
          <Select defaultValue="English (US)" options={["English (US)", "French", "Spanish", "German"]} />
        </Field>
        <Field label="Timezone">
          <Select defaultValue="Europe/Paris" options={["Europe/Paris", "Europe/London", "America/New_York", "America/Los_Angeles"]} />
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-[#120b2f]">Email Notifications</p>
        <label className="flex items-center gap-2 text-sm text-[#120b2f]/75">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-neutral-300 accent-violet-600" />
          Receive a daily email summary of due follow-ups and replies
        </label>
      </div>
    </SettingsCard>
  );
}

function SecuritySettings() {
  return (
    <SettingsCard
      icon={<ShieldCheck className="h-5 w-5" />}
      title="Security Settings"
      description="Update your password and account security"
    >
      <div className="grid max-w-xl gap-5">
        <Field label="Current Password *"><Input type="password" placeholder="Enter your current password" /></Field>
        <Field label="New Password *"><Input type="password" placeholder="Enter your new password (min. 8 characters)" /></Field>
        <Field label="Confirm New Password *"><Input type="password" placeholder="Confirm your new password" /></Field>
      </div>
    </SettingsCard>
  );
}

function BillingSettings() {
  const [cancelStep, setCancelStep] = React.useState<"idle" | "offer" | "confirm" | "cancelled">("idle");
  const [invoices, setInvoices] = React.useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [subscribeLoading, setSubscribeLoading] = React.useState(false);
  const [subscription, setSubscription] = React.useState<{
    plan: string;
    status: string;
    isTrialing: boolean;
    isActive: boolean;
    isExpired: boolean;
    daysRemaining: number | null;
    trialEndsAt: string | null;
  } | null>(null);

  // Fetch subscription and invoices on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [subRes, invRes] = await Promise.all([
          fetch("/api/subscription", { headers }),
          fetch("/api/invoices", { headers }),
        ]);

        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData.subscription);
        }

        if (invRes.ok) {
          const invData = await invRes.json();
          setInvoices(invData.invoices ?? []);
        }
      } catch {
        // Silently fail
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async () => {
    setSubscribeLoading(true);
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
      setSubscribeLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`/api/invoices/${invoiceId}/download`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.open(data.url, "_blank");
        }
      }
    } catch {
      // Error handled silently
    } finally {
      setDownloadingId(null);
    }
  };

  const statusLabel = subscription?.isTrialing
    ? "Free trial"
    : subscription?.isActive
      ? "Active"
      : subscription?.isExpired
        ? "Expired"
        : "No subscription";

  const statusColor = subscription?.isTrialing
    ? "text-emerald-700"
    : subscription?.isActive
      ? "text-emerald-700"
      : "text-rose-700";

  return (
    <SettingsCard
      icon={<CreditCard className="h-5 w-5" />}
      title="Billing Settings"
      description="Manage plan, billing email, and payment preferences"
      showSave={false}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Plan"><Input defaultValue="Solo" readOnly /></Field>
        <Field label="Status">
          <div className={`flex h-10 items-center rounded-md border border-neutral-300 bg-neutral-50 px-3 text-sm font-semibold ${statusColor}`}>
            {statusLabel}
            {subscription?.isTrialing && subscription.daysRemaining != null ? ` — ${subscription.daysRemaining} days left` : ""}
          </div>
        </Field>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <BillingMetric label="Monthly price" value="$19.99" detail="billed monthly" />
        <BillingMetric
          label="Next renewal"
          value={subscription?.isActive ? "Active" : subscription?.isTrialing ? `${subscription.daysRemaining ?? 0}d` : "—"}
          detail={subscription?.isActive ? "automatic renewal" : subscription?.isTrialing ? "trial period" : "no active plan"}
        />
        <BillingMetric label="Plan" value="Solo" detail="single workspace" />
      </div>

      {/* Subscribe CTA if not active */}
      {(!subscription?.isActive && !subscription?.isTrialing) || subscription?.isExpired ? (
        <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[#120b2f]">Subscribe to Verytis Solo</p>
              <p className="mt-1 text-sm text-[#120b2f]/55">Get unlimited access to all features for $19.99/month.</p>
            </div>
            <Button type="button" variant="accent" onClick={handleSubscribe} disabled={subscribeLoading}>
              <CreditCard className="h-4 w-4" />
              {subscribeLoading ? "Redirecting..." : "Subscribe now"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Active subscription management */}
      {subscription?.isActive ? (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[#120b2f]">Current subscription</p>
              <p className="mt-1 text-sm text-[#120b2f]/55">Your Solo plan is active at $19.99 per month.</p>
            </div>
            <Button variant="secondary" onClick={handleSubscribe}>Manage billing</Button>
          </div>
        </div>
      ) : null}

      {/* Invoices section */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-[#120b2f]">Invoice History</p>
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
            <p className="text-sm text-[#120b2f]/50">No invoices yet. Invoices will appear here after your first payment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-violet-500/15 bg-white p-3">
                <div>
                  <p className="text-sm font-semibold text-[#120b2f]">{invoice.name}</p>
                  <p className="mt-0.5 text-xs text-[#120b2f]/50">
                    {new Date(invoice.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadInvoice(invoice.id)}
                  disabled={downloadingId === invoice.id}
                >
                  {downloadingId === invoice.id ? "Loading..." : "Download PDF"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation flow for active subscriptions */}
      {subscription?.isActive ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-semibold text-[#120b2f]">Subscription cancellation</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#120b2f]/60">
                Review the retention offer before cancelling your subscription.
              </p>
            </div>
            {cancelStep === "idle" ? (
              <Button type="button" variant="secondary" onClick={() => setCancelStep("offer")}>
                Cancel subscription
              </Button>
            ) : null}
          </div>

          {cancelStep === "offer" ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
              <p className="text-sm font-semibold text-emerald-700">Before you unsubscribe</p>
              <p className="mt-2 text-xl font-bold text-[#120b2f]">Keep Solo with 30% off</p>
              <p className="mt-1 text-sm text-[#120b2f]/60">
                Your monthly price becomes <strong>$13.99</strong> instead of <strong>$19.99</strong>.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setCancelStep("confirm")}>
                  Continue cancellation
                </Button>
                <Button type="button" variant="accent" onClick={() => setCancelStep("idle")}>
                  Keep 30% discount
                </Button>
              </div>
            </div>
          ) : null}

          {cancelStep === "confirm" ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-white p-4">
              <p className="text-sm font-semibold text-rose-700">Confirm unsubscribe</p>
              <p className="mt-2 text-sm leading-6 text-[#120b2f]/60">
                Your workspace will keep access until the end of the current billing period. You can reactivate later from Billing.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setCancelStep("idle")}>
                  Keep subscription
                </Button>
                <Button type="button" className="border border-rose-600 bg-rose-600 text-white hover:bg-rose-700" onClick={() => setCancelStep("cancelled")}>
                  Unsubscribe
                </Button>
              </div>
            </div>
          ) : null}

          {cancelStep === "cancelled" ? (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
              <p className="font-semibold text-[#120b2f]">Subscription scheduled to cancel</p>
              <p className="mt-1 text-sm text-[#120b2f]/60">Your plan remains active until the end of the current billing period.</p>
              <Button type="button" variant="secondary" className="mt-4" onClick={() => setCancelStep("idle")}>
                Reactivate subscription
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </SettingsCard>
  );
}

function BillingMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-violet-500/15 bg-violet-50/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-violet-900/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#120b2f]">{value}</p>
      <p className="mt-1 text-sm text-[#120b2f]/50">{detail}</p>
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
  showSave = true,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  showSave?: boolean;
}) {
  return (
    <Card className="overflow-hidden rounded-xl border-neutral-200 bg-white shadow-sm">
      <CardHeader className="border-b border-neutral-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-700">
              {icon}
            </span>
            <div>
              <CardTitle className="text-lg text-[#120b2f]">{title}</CardTitle>
              <p className="mt-1 text-sm text-[#120b2f]/65">{description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-6">
        {children}
        {showSave ? (
          <div className="mt-8 border-t border-neutral-200 pt-6 text-right">
            <Button variant="accent">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#120b2f]">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[#120b2f]/50">{hint}</span> : null}
    </label>
  );
}

function Select({ defaultValue, options }: { defaultValue: string; options: string[] }) {
  return (
    <select defaultValue={defaultValue} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-[#120b2f] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}
