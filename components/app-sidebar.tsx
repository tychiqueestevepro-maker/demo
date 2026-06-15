"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Bell,
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Home,
  Layers3,
  LogOut,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";

import { searchWorkspace } from "@/app/actions/search";
import { VerytisLogo } from "@/components/brand";
import { cn } from "@/lib/utils";

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

type NotificationType = {
  id: string | number;
  title: string;
  target: string;
  campaign: string;
  time: string;
  url?: string;
};

type SearchResult = {
  id: string;
  href: string;
  title: string;
  detail: string;
  type: string;
};

export function AppSidebar({
  user,
  initialNotifications = [],
}: {
  user?: { name?: string; email?: string; initials?: string };
  initialNotifications?: NotificationType[];
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
    <aside
      className={cn(
        "sticky top-0 z-20 hidden h-screen shrink-0 overflow-visible border-r border-white/15 bg-[radial-gradient(circle_at_30%_0%,rgba(216,180,254,0.38),transparent_34%),linear-gradient(180deg,#7c3aed_0%,#5b21b6_54%,#3b168f_100%)] px-4 py-5 text-white shadow-2xl shadow-violet-950/20 transition-all duration-300 lg:block",
        collapsed ? "w-24" : "w-72",
      )}
    >
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

        <div className="relative mt-auto space-y-3 pt-8">
          <Link
            href="/app/campaigns/new"
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-violet-800 shadow-xl shadow-violet-950/20 transition hover:bg-violet-50",
              collapsed && "hidden",
            )}
          >
            <Plus className="h-4 w-4" />
            Create campaign
          </Link>

          {notificationsOpen && !collapsed && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-full rounded-2xl border border-violet-500/15 bg-white p-3 text-[#120b2f] shadow-2xl shadow-violet-950/30">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Notifications</span>
                <button onClick={() => setNotificationsOpen(false)} className="text-neutral-400 hover:text-neutral-900" aria-label="Close notifications">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="custom-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
                <SubscriptionExpiredNotification />
                {notifications.length === 0 ? (
                  <p className="py-3 text-center text-sm text-[#120b2f]/50">No pending follow-ups.</p>
                ) : (
                  notifications.map((notif) => {
                    const content = (
                      <>
                        <p className="text-xs font-semibold text-rose-600">{notif.title}</p>
                        <p className="mt-0.5 font-medium">{notif.target}</p>
                        <div className="mt-1 flex items-center justify-between text-xs text-[#120b2f]/50">
                          <span>{notif.campaign}</span>
                          <span>{notif.time}</span>
                        </div>
                      </>
                    );

                    return notif.url ? (
                      <Link
                        key={notif.id}
                        href={notif.url}
                        onClick={() => setNotificationsOpen(false)}
                        className="block w-full rounded-xl border border-violet-100 bg-violet-50/50 p-2.5 text-left text-sm transition hover:bg-violet-100"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        key={notif.id}
                        onClick={() => setNotifications((items) => items.filter((item) => item.id !== notif.id))}
                        className="block w-full rounded-xl border border-violet-100 bg-violet-50/50 p-2.5 text-left text-sm transition hover:bg-violet-100"
                      >
                        {content}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className={cn("flex items-center gap-2 rounded-2xl border border-white/15 bg-white/12 p-2 shadow-xl shadow-violet-950/10", collapsed && "flex-col justify-center border-transparent bg-transparent p-0 shadow-none")}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
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
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-bold uppercase text-violet-800 shadow-lg shadow-violet-950/15">
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
  const [isExpired, setIsExpired] = React.useState(() => {
    if (typeof document === "undefined") return false;
    return document.querySelector("[data-auth-expired]")?.getAttribute("data-auth-expired") === "true";
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ isExpired?: boolean }>).detail;
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
      // Error handled silently.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-bold text-amber-800">Subscription expired</p>
      <p className="mt-1 text-xs text-amber-700/70">Your free trial has ended.</p>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Subscribe - $19.99/mo"}
      </button>
    </div>
  );
}

function SidebarSearchItem({ collapsed }: { collapsed: boolean }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const normalizedQuery = query.trim().toLowerCase();

  React.useEffect(() => {
    if (!normalizedQuery) return;

    let cancelled = false;
    startTransition(async () => {
      const data = await searchWorkspace(normalizedQuery);
      if (!cancelled) {
        setResults(data);
      }
    });

    return () => {
      cancelled = true;
    };
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
                  {isPending ? "Searching..." : "No result found."}
                </div>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
