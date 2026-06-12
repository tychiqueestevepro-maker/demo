import { AppSidebar } from "@/components/product-components";
import { AuthProvider } from "@/components/auth-provider";
import { SubscriptionBanner } from "@/components/subscription-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white text-[#120b2f] lg:flex">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(216,180,254,0.20),transparent_32%)]" />
        <AppSidebar />
        <div className="relative z-10 min-w-0 flex-1">
          <main className="w-full px-4 py-8 md:px-6 xl:px-8 2xl:px-10">
            <SubscriptionBanner />
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
