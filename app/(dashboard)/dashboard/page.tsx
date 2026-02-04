"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, Plus, Sparkles, Send, Loader2, Code2, 
  PanelLeftClose, PanelLeftOpen, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useN8nProcessor, extractCodeFromMessage } from "@/hooks/use-n8n-processor";
import { CodeViewer } from "@/components/code-viewer";
// Icons import fix (just in case)
import { MessageSquare, Eye } from "lucide-react";

// --- UI Components ---
const Button = ({ className, variant = "ghost", size = "default", children, ...props }: any) => {
  const variants: any = {
    ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-white",
    primary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  };
  const sizes: any = { icon: "h-10 w-10 center p-0", default: "h-10 px-4 py-2" };
  return (
    <button className={cn("rounded-lg transition-colors font-medium flex items-center justify-center gap-2", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [viewMode, setViewMode] = useState<"chat" | "preview" | "split">("split");
  
  const { messages, isLoading, sendMessage, hasMessages, sessionId } = useN8nProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Lógica de Visualização ---
  // Pega a última mensagem da IA
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  // Verifica se tem código nela
  const generatedCode = lastAssistantMessage ? extractCodeFromMessage(lastAssistantMessage.content) : null;
  // Define se deve mostrar o painel de preview
  const showPreview = hasMessages && !!generatedCode;

  // Função para limpar o texto do chat (remove o bloco de código para não poluir)
  const cleanChatMessage = (content: string) => {
    return content.replace(/```[\s\S]*?```/g, '').trim();
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    if (viewMode === 'preview') setViewMode('split');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen w-full bg-[#131314] text-zinc-100 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className="h-full bg-[#1E1F20] border-r border-zinc-800/50 hidden md:flex flex-col overflow-hidden"
      >
        <div className="p-4 w-[280px] flex flex-col h-full">
          <div className="mt-14 mb-6">
            <Button variant="primary" className="w-full justify-start pl-4 rounded-full h-12 bg-[#28292C]">
              <Plus size={20} className="text-zinc-500" />
              <span className="text-sm">Nova conversa</span>
            </Button>
          </div>
          <div className="flex-1 text-zinc-500 text-sm px-2 italic">
            ID da Sessão:<br/>
            <span className="font-mono text-xs text-zinc-600">{sessionId}</span>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* HEADER */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800/50 bg-[#131314] z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Gemini Builder
            </span>
          </div>

          {/* TOGGLES DE VISUALIZAÇÃO */}
          <AnimatePresence>
            {showPreview && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex bg-[#1E1F20] rounded-lg p-1 border border-zinc-800/50 absolute left-1/2 -translate-x-1/2"
              >
                {[
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'split', label: 'Split', icon: PanelLeftOpen },
                  { id: 'preview', label: 'Preview', icon: Eye }
                ].map((mode: any) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-2",
                      viewMode === mode.id ? "bg-zinc-700 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
             <img src="https://github.com/shadcn.png" alt="User" />
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* 1. CHAT COLUMN */}
          <AnimatePresence mode="wait">
            {(viewMode === 'chat' || viewMode === 'split') && (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, width: (viewMode === 'split' && showPreview) ? "35%" : "100%" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col border-r border-zinc-800/50 bg-[#131314] relative z-10"
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                  
                  {/* Zero State */}
                  {!hasMessages && (
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                       <h1 className="text-4xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent pb-4">
                        Olá, Paulo
                       </h1>
                       <p className="text-zinc-500 text-lg">O que vamos construir hoje?</p>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((msg) => {
                    const hasCode = msg.role === 'assistant' && extractCodeFromMessage(msg.content);
                    const displayText = msg.role === 'assistant' ? cleanChatMessage(msg.content) : msg.content;

                    return (
                      <div key={msg.id} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[90%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                          msg.role === 'user' ? "bg-[#28292C] text-zinc-100 rounded-tr-sm" : "bg-transparent text-zinc-300 pl-0"
                        )}>
                          
                          {/* Texto da mensagem (limpo de código) */}
                          <div dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br/>') }} />

                          {/* Card Especial se houver código */}
                          {hasCode && (
                            <div 
                              onClick={() => setViewMode('preview')}
                              className="mt-3 cursor-pointer bg-[#1E1F20] border border-zinc-700/50 rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/50 hover:bg-[#252628] transition-all group w-full"
                            >
                              <div className="bg-blue-500/10 p-2.5 rounded-lg group-hover:bg-blue-500/20 text-blue-400">
                                <Code2 size={20} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-zinc-200 text-sm">Código React Gerado</p>
                                <p className="text-xs text-zinc-500 group-hover:text-blue-400/80 transition-colors">Toque para visualizar</p>
                              </div>
                              <Sparkles size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                     <div className="flex items-center gap-3 text-zinc-500 text-sm animate-pulse px-4">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                        <span>Gerando interface...</span>
                     </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#131314] border-t border-zinc-800/50">
                  <div className="bg-[#1E1F20] rounded-[24px] border border-zinc-700/50 flex items-end p-2 focus-within:ring-1 ring-blue-500/30 shadow-lg transition-all">
                     <textarea 
                        className="bg-transparent flex-1 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-500 resize-none max-h-32 min-h-[44px] scrollbar-hide"
                        placeholder="Descreva sua interface (ex: Dashboard financeiro dark mode)..."
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
                      className="m-1 p-2 bg-white text-black hover:bg-zinc-200 rounded-full transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500"
                     >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. PREVIEW COLUMN (SANDBOX) */}
          <AnimatePresence mode="wait">
            {showPreview && (viewMode === 'preview' || viewMode === 'split') && (
              <motion.div 
                 layout
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0, flex: 1 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="bg-[#09090b] flex flex-col border-l border-zinc-800 overflow-hidden relative shadow-2xl"
              >
                 {generatedCode ? (
                   <div className="h-full w-full p-0">
                      {/* Componente Sandpack isolado */}
                      <CodeViewer code={generatedCode} />
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                        <Terminal size={48} className="relative z-10 text-zinc-400" />
                      </div>
                      <p>Aguardando código do assistente...</p>
                   </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}