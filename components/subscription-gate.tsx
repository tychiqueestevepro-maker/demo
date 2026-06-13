"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { AlertTriangle, CreditCard, Lock } from "lucide-react";
import { Button } from "./ui/button";

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { subscription, session } = useAuth();
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);

  // If loading or not expired, or on settings page, allow access
  if (subscription === null || !subscription.isExpired || pathname === "/app/settings") {
    return <>{children}</>;
  }

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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
        <Lock className="h-10 w-10" />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-[#120b2f]">Subscription required</h2>
      <p className="mb-8 max-w-md text-[#120b2f]/60 leading-relaxed">
        Your free trial has ended and access to campaigns, playbooks, and targets is currently locked. Subscribe to restore your access instantly.
      </p>
      
      <div className="flex gap-4">
        <Button onClick={handleSubscribe} disabled={loading} variant="accent" className="h-11 px-6 shadow-lg shadow-violet-600/25 transition-all hover:scale-105 active:scale-95">
          <CreditCard className="mr-2 h-5 w-5" />
          {loading ? "Redirecting..." : "Subscribe for $19.99/mo"}
        </Button>
      </div>
    </div>
  );
}
