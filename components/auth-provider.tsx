"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";

type SubscriptionInfo = {
  plan: string;
  status: string;
  isTrialing: boolean;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionInfo | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  subscription: null,
  loading: true,
  signOut: async () => {},
  refreshSubscription: async () => {},
});

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [subscription, setSubscription] = React.useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchSubscription = React.useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.access_token) {
      setSubscription(null);
      return;
    }

    try {
      const response = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        // Dispatch event for components outside the context tree (e.g., sidebar notification)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("subscription-status", { detail: data.subscription }),
          );
        }
      }
    } catch {
      // Subscription fetch failed silently
    }
  }, []);

  React.useEffect(() => {
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchSubscription(initialSession);
      } else {
        router.push("/login");
      }

      setLoading(false);
    };

    initAuth();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (!newSession) {
          setSubscription(null);
          router.push("/login");
        }
      },
    );

    return () => {
      authSub.unsubscribe();
    };
  }, [router, fetchSubscription]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription(null);
    router.push("/login");
  }, [router]);

  const refreshSubscription = React.useCallback(async () => {
    await fetchSubscription(session);
  }, [session, fetchSubscription]);

  const value = React.useMemo(
    () => ({ user, session, subscription, loading, signOut, refreshSubscription }),
    [user, session, subscription, loading, signOut, refreshSubscription],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
