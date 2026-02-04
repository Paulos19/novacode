"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Loader2, Code2, Terminal, Sparkles,
  MessageSquare, PanelLeftOpen, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useN8nProcessor } from "@/hooks/use-n8n-processor";
import { CodeViewer } from "@/components/code-viewer";

export default function DashboardPage() {
  const [inputText, setInputText] = useState("");
  // Estado local de visualização apenas para o workspace (Split, Chat ou Preview)
  const [viewMode, setViewMode] = useState<"chat" | "preview" | "split">("split");
  
  const { messages, isLoading, sendMessage, hasMessages } = useN8nProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Lógica de Detecção de Arquivos ---
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  // Verifica se a mensagem possui a propriedade 'files' (Multi-file support)
  const generatedFiles = lastAssistantMessage?.files; 
  const showPreview = hasMessages && !!generatedFiles;

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    // Se estiver focado só no preview, volta para split ao enviar nova mensagem
    if (viewMode === 'preview') setViewMode('split');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll ao receber mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-1 overflow-hidden relative h-full w-full bg-[#131314]">
      
      {/* Controles Flutuantes de Visualização (Overlay) */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex bg-[#1E1F20]/90 backdrop-blur border border-zinc-800/50 rounded-full p-1 shadow-xl"
          >
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'split', label: 'Split', icon: PanelLeftOpen },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-2",
                  viewMode === mode.id 
                    ? "bg-zinc-700 text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                <mode.icon size={14} />
                {mode.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- COLUNA 1: CHAT --- */}
      <AnimatePresence mode="wait">
        {(viewMode === 'chat' || viewMode === 'split') && (
          <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, width: (viewMode === 'split' && showPreview) ? "40%" : "100%" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col border-r border-zinc-800/50 bg-[#131314] relative z-10 h-full"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              
              {/* Zero State */}
              {!hasMessages && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 gap-4">
                   <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                      <Sparkles className="w-8 h-8 text-blue-500" />
                   </div>
                   <div className="text-center space-y-2">
                     <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Como posso ajudar?
                     </h1>
                     <p className="text-zinc-500 text-sm max-w-xs">
                       Descreva a interface, componente ou lógica que deseja construir.
                     </p>
                   </div>
                </div>
              )}

              {/* Lista de Mensagens */}
              {messages.map((msg) => {
                const hasFiles = msg.role === 'assistant' && msg.files && Object.keys(msg.files).length > 0;
                
                return (
                  <div key={msg.id} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[90%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm border",
                      msg.role === 'user' 
                        ? "bg-[#28292C] border-zinc-700/50 text-zinc-100 rounded-tr-sm" 
                        : "bg-transparent border-transparent text-zinc-300 pl-0"
                    )}>
                      
                      {/* Conteúdo Texto */}
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />

                      {/* Card de Projeto Gerado */}
                      {hasFiles && (
                        <div 
                          onClick={() => setViewMode('preview')}
                          className="mt-4 cursor-pointer bg-[#1E1F20] border border-zinc-700/50 rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/50 hover:bg-[#252628] transition-all group w-full"
                        >
                          <div className="bg-blue-500/10 p-2.5 rounded-lg group-hover:bg-blue-500/20 text-blue-400 transition-colors">
                            <Code2 size={20} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-zinc-200 text-sm">Projeto Gerado</p>
                            <p className="text-xs text-zinc-500 group-hover:text-blue-400/80 transition-colors">
                              {Object.keys(msg.files || {}).length} arquivos criados
                            </p>
                          </div>
                          <Sparkles size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                 <div className="flex items-center gap-3 text-zinc-500 text-xs animate-pulse px-4 py-2">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span>Processando solicitação...</span>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#131314] border-t border-zinc-800/50">
              <div className="bg-[#1E1F20] rounded-[24px] border border-zinc-700/50 flex items-end p-2 focus-within:ring-1 focus-within:ring-blue-500/30 focus-within:border-blue-500/30 shadow-lg transition-all">
                 <textarea 
                    className="bg-transparent flex-1 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none max-h-32 min-h-[44px] scrollbar-hide"
                    placeholder="Descreva seu app (ex: Landing Page SaaS com Shadcn)..."
                    rows={1}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={handleKeyDown}
                 />
                 <button 
                  onClick={handleSend} 
                  disabled={!inputText.trim() || isLoading}
                  className="m-1 h-8 w-8 flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded-full transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500"
                 >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- COLUNA 2: PREVIEW (SANDBOX) --- */}
      <AnimatePresence mode="wait">
        {showPreview && (viewMode === 'preview' || viewMode === 'split') && (
          <motion.div 
             layout
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0, flex: 1 }}
             exit={{ opacity: 0, x: 20 }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
             className="bg-[#09090b] flex flex-col border-l border-zinc-800 overflow-hidden relative shadow-2xl h-full"
          >
             {generatedFiles ? (
               <div className="h-full w-full p-0">
                  <CodeViewer files={generatedFiles} />
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 rounded-full"></div>
                    <Terminal size={48} className="relative z-10 text-zinc-600" />
                  </div>
                  <p className="text-sm">Aguardando geração de código...</p>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}