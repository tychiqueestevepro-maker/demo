import { AppSidebar, Topbar } from "@/components/product-components";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-neutral-950 lg:flex">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}

