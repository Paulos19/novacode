import React from "react";
import { User, CreditCard, LogOut, MessageSquare, Home, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; // Supondo Shadcn UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function IdeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      
      {/* --- NOVA SIDEBAR (Mínima) --- */}
      <aside className="w-14 flex flex-col items-center py-4 border-r border-zinc-800 bg-[#09090b] shrink-0 z-50">
        
        {/* Logo / Home */}
        <Link href="/dashboard" className="mb-6 p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
          <Home size={20} />
        </Link>

        {/* Navegação Principal */}
        <nav className="flex flex-col gap-2 w-full px-2">
          <button className="p-2 rounded-md bg-zinc-800 text-white flex justify-center" title="Chat Atual">
            <MessageSquare size={20} />
          </button>
          <button className="p-2 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors flex justify-center" title="Histórico">
            <Settings size={20} />
          </button>
        </nav>

        <div className="flex-1" />

        {/* --- USER DROPDOWN (Profile/Billing/Logout) --- */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 hover:ring-2 ring-zinc-700 transition-all cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 bg-[#18181b] border-zinc-800 text-zinc-200">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
              <User size={14} /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
              <CreditCard size={14} /> Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="focus:bg-red-900/20 focus:text-red-400 text-red-500 cursor-pointer gap-2">
              <LogOut size={14} /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* --- ÁREA PRINCIPAL (Page Content) --- */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}