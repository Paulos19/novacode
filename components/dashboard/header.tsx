"use client";

import { PanelLeftClose, PanelLeftOpen, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/dashboard/user-nav";
import { useDashboard } from "@/components/providers/dashboard-provider";

export function Header() {
  const { isSidebarOpen, toggleSidebar } = useDashboard();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800/50 bg-[#0F0F10]/50 backdrop-blur-sm z-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </Button>

        {/* Breadcrumb Minimalista */}
        <div className="hidden md:flex items-center text-sm text-zinc-500 gap-2">
          <span className="hover:text-zinc-300 transition-colors cursor-pointer">Dashboard</span>
          <Slash size={12} className="text-zinc-700" />
          <span className="text-zinc-200 font-medium">Playground</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}