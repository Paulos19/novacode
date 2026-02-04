import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen w-full bg-[#09090b] overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
          <Header />
          <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}