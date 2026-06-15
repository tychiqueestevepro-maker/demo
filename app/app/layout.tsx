import { AppSidebar } from "@/components/product-components";
import { AuthProvider } from "@/components/auth-provider";
import { SubscriptionBanner } from "@/components/subscription-banner";
import { SubscriptionGate } from "@/components/subscription-gate";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userAuth;
  try {
    userAuth = await getServerUser();
  } catch {
    redirect("/login");
  }

  const userId = userAuth.userId;

  // Use user info from auth context directly (no extra DB call)
  const userName = userAuth.name || userAuth.email || "Verytis User";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const user = {
    name: userName,
    email: userAuth.email,
    initials,
  };

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "DUE"] },
      dueAt: { lte: endOfToday },
    },
    select: {
      id: true,
      dueAt: true,
      target: { select: { name: true } },
      campaign: { select: { id: true, name: true } },
    },
    orderBy: { dueAt: "asc" },
  });

  const groupedByCampaign = dueFollowUps.reduce((acc, fu) => {
    if (!acc[fu.campaign.id]) {
      acc[fu.campaign.id] = { campaignName: fu.campaign.name, items: [] };
    }
    acc[fu.campaign.id].items.push(fu);
    return acc;
  }, {} as Record<string, { campaignName: string, items: typeof dueFollowUps }>);

  const notifications: any[] = [];

  for (const campaignId in groupedByCampaign) {
    const group = groupedByCampaign[campaignId];
    const items = group.items;
    let targetText = "";
    
    if (items.length === 1) {
      targetText = `${items[0].target.name} is waiting for follow-up`;
    } else if (items.length === 2) {
      targetText = `${items[0].target.name} and ${items[1].target.name} are waiting for follow-up`;
    } else {
      targetText = `${items[0].target.name}, ${items[1].target.name} + ${items.length - 2} others are waiting for follow-up`;
    }

    notifications.push({
      id: `campaign-${campaignId}`,
      title: "Action required",
      target: targetText,
      campaign: group.campaignName,
      time: "Now",
      url: `/app/campaigns/${campaignId}`,
    });
  }

  // Add a system notification example
  notifications.push({
    id: "sys-feature-1",
    title: "New feature",
    target: "AI Playbook generator is now available in beta!",
    campaign: "System",
    time: "Today",
  });

  return (
    <AuthProvider>
      <div className="min-h-screen overflow-x-clip bg-white text-[#120b2f] lg:flex">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(216,180,254,0.20),transparent_32%)]" />
        <AppSidebar user={user} initialNotifications={notifications} />
        <div className="relative z-10 min-w-0 flex-1">
          <main className="w-full px-4 py-8 md:px-6 xl:px-8 2xl:px-10">
            <SubscriptionBanner />
            <SubscriptionGate>
              {children}
            </SubscriptionGate>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
