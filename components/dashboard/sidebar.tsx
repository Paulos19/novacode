"use client";

import { motion } from "framer-motion";
import { Plus, MessageSquare, CreditCard, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button"; //
import { cn } from "@/lib/utils"; //
import { useDashboard } from "@/components/providers/dashboard-provider";

// Mock de dados para simular a integração futura com Prisma
const MOCK_HISTORY = [
  { id: "1", title: "E-commerce Dashboard", date: "Há 2 horas" },
  { id: "2", title: "Landing Page SaaS", date: "Ontem" },
  { id: "3", title: "Auth Flow System", date: "3 dias atrás" },
];

export function Sidebar() {
  const { isSidebarOpen } = useDashboard();

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isSidebarOpen ? 280 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-[#0F0F10] border-r border-zinc-800/50 hidden md:flex flex-col overflow-hidden relative z-30"
    >
      <div className="flex flex-col h-full w-[280px] p-4">
        {/* Logo Area */}
        <div className="h-14 flex items-center px-2 mb-6 gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            NovaCode
          </span>
        </div>

        {/* New Chat Button */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 h-12 border-zinc-700/50 bg-zinc-800/20 hover:bg-zinc-800 hover:text-white text-zinc-300 transition-all mb-8 group"
        >
          <div className="p-1 bg-blue-500/10 rounded group-hover:bg-blue-500/20 text-blue-400">
             <Plus size={18} />
          </div>
          <span className="font-medium">Nova Conversa</span>
        </Button>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 flex items-center gap-2">
            <History size={12} />
            Recentes
          </div>
          
          <div className="space-y-1">
            {MOCK_HISTORY.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex flex-col items-start gap-1 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors text-left group"
              >
                <span className="text-sm text-zinc-300 group-hover:text-white truncate w-full font-medium">
                  {chat.title}
                </span>
                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                  {chat.date}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Card */}
        <div className="mt-auto pt-6">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-4 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={48} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-zinc-200 font-semibold">
                <CreditCard size={16} className="text-purple-400" />
                <span>Plano Pro</span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Acesso ilimitado ao modelo V2 e exportação de código.
              </p>
              <Button size="sm" className="w-full bg-zinc-100 text-black hover:bg-zinc-300 h-8 text-xs font-semibold">
                Gerir Assinatura
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}