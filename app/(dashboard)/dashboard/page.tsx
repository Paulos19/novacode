"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  LayoutTemplate, 
  Terminal, 
  Zap,
  Clock,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Sugestões rápidas para o usuário não ficar com a "tela em branco"
const SUGGESTIONS = [
  { 
    icon: LayoutTemplate, 
    label: "Landing Page SaaS", 
    prompt: "Crie uma Landing Page para um SaaS de inteligência artificial com tema dark, usando Shadcn UI e Framer Motion." 
  },
  { 
    icon: Terminal, 
    label: "Dashboard Admin", 
    prompt: "Desenvolva um layout de Dashboard administrativo com sidebar colapsável, gráficos e tabela de usuários." 
  },
  { 
    icon: Zap, 
    label: "To-do List App", 
    prompt: "Gere um aplicativo de lista de tarefas minimalista com funcionalidade de drag-and-drop e persistência local." 
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleStartProject = (prompt: string = inputText) => {
    if (!prompt.trim()) return;
    
    // Codifica o prompt na URL para a rota /code recuperar e iniciar o chat automaticamente
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/code?start=${encodedPrompt}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartProject();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mask-image-gradient" />

      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-6 py-4 relative z-10">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="bg-blue-600 rounded-lg p-1.5 shadow-lg shadow-blue-500/20">
            <Sparkles size={16} className="text-white" fill="currentColor" />
          </div>
          <span>AI Builder</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-sm text-zinc-400 hover:text-white transition-colors">Docs</button>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <button className="text-sm text-zinc-400 hover:text-white transition-colors">Histórico</button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-zinc-700 transition-colors">
            JD
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 max-w-4xl mx-auto w-full -mt-20">
        
        {/* Hero Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent pb-2">
            O que vamos construir hoje?
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Gere interfaces completas, refatore código ou crie componentes <br className="hidden md:block"/>
            apenas descrevendo sua ideia.
          </p>
        </motion.div>

        {/* --- INPUT PRINCIPAL --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={cn(
            "w-full bg-[#18181b] rounded-2xl border transition-all duration-300 shadow-2xl relative overflow-hidden group",
            isFocused 
              ? "border-blue-500/50 ring-4 ring-blue-500/10 shadow-blue-500/5" 
              : "border-zinc-800 hover:border-zinc-700"
          )}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Crie um dashboard de e-commerce com gráficos e dark mode..."
            className="w-full bg-transparent text-lg text-white placeholder:text-zinc-500 px-6 py-5 min-h-[80px] md:min-h-[120px] outline-none resize-none scrollbar-hide"
          />
          
          <div className="px-4 py-3 bg-[#18181b] border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <button className="text-xs font-medium text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-800 transition-colors flex items-center gap-1">
                 <LayoutTemplate size={14} /> Modelos
               </button>
               <button className="text-xs font-medium text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-800 transition-colors flex items-center gap-1">
                 <Terminal size={14} /> Config
               </button>
            </div>

            <button 
              onClick={() => handleStartProject()}
              disabled={!inputText.trim()}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-200",
                inputText.trim() 
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              Gerar Código <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* --- SUGESTÕES --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full"
        >
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleStartProject(sug.prompt)}
              className="flex flex-col items-start p-4 rounded-xl border border-zinc-800/60 bg-[#131314] hover:bg-[#18181b] hover:border-zinc-700 transition-all text-left group"
            >
              <div className="mb-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                <sug.icon size={18} />
              </div>
              <span className="text-sm font-medium text-zinc-200 group-hover:text-white mb-1">
                {sug.label}
              </span>
              <span className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                {sug.prompt}
              </span>
            </button>
          ))}
        </motion.div>

      </main>

      {/* --- RECENT PROJECTS (Footer Area) --- */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-8 relative z-10 border-t border-zinc-800/50 mt-auto">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
             <Clock size={14} /> Recentes
           </h3>
           <button className="text-xs text-blue-400 hover:underline">Ver todos</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {/* Mock de Projeto Recente */}
           {[1, 2, 3].map((i) => (
             <div key={i} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors border border-transparent hover:border-zinc-800">
                <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-zinc-300 border border-zinc-800">
                  <LayoutTemplate size={18} />
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Projeto Alpha {i}</span>
                   <span className="text-xs text-zinc-600">Editado há 2h</span>
                </div>
                <ChevronRight size={14} className="ml-auto text-zinc-700 group-hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-all" />
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
}