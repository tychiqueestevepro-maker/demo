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
  } catch (error) {
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

  // Fetch notifications in parallel (not blocking render)
  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "DUE"] },
      dueAt: { lte: new Date() },
    },
    select: {
      id: true,
      dueAt: true,
      target: { select: { name: true } },
      campaign: { select: { name: true } },
    },
    orderBy: { dueAt: "asc" },
    take: 20,
  });

  const notifications = dueFollowUps.map((fu) => ({
    id: fu.id,
    title: "Action required: Follow-up due",
    target: fu.target.name,
    campaign: fu.campaign.name,
    time: new Date(fu.dueAt).toLocaleDateString(),
  }));

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white text-[#120b2f] lg:flex">
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
