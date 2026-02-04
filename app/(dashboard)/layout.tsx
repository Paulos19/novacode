import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { auth } from "@/auth"; //
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
      <div className="flex h-screen w-full bg-[#131314] overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}