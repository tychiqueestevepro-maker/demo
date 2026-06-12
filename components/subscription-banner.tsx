"use client";

import * as React from "react";
import { AlertTriangle, CreditCard } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase/client";

export function SubscriptionBanner() {
  const { subscription, session } = useAuth();
  const [loading, setLoading] = React.useState(false);

  if (!subscription?.isExpired) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
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
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-rose-300/50 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-5 py-4 shadow-lg shadow-rose-500/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(251,113,133,0.15),transparent_50%)]" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-rose-800">Subscription expired</p>
            <p className="mt-1 text-sm text-rose-700/70">
              Your free trial has ended. Subscribe to continue using Verytis.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] hover:from-violet-700 hover:to-violet-800 active:scale-[0.98] disabled:opacity-60"
        >
          <CreditCard className="h-4 w-4" />
          {loading ? "Redirecting..." : "Subscribe now — $19.99/mo"}
        </button>
      </div>
    </div>
  );
}

export function SubscriptionNotificationDot() {
  const { subscription } = useAuth();

  if (!subscription?.isExpired) return null;

  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
    </span>
  );
}
