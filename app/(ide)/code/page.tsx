"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Import necessário para ler a URL
import { SendHorizontal, Paperclip, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { CodeViewer } from "@/components/code-viewer";
import { useN8nProcessor } from "@/hooks/use-n8n-processor";
import { cn } from "@/lib/utils";

export default function CodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startPrompt = searchParams.get("start");
  
  // Estado local para o input do chat (novas mensagens)
  const [input, setInput] = useState("");
  
  // Hook de processamento da IA
  const { messages, isLoading, sendMessage } = useN8nProcessor();
  
  // Ref para evitar disparo duplo em StrictMode (comum no React 18/Next)
  const hasStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. EFEITO DE INICIALIZAÇÃO (AUTO-SEND) ---
  useEffect(() => {
    if (startPrompt && !hasStartedRef.current) {
      hasStartedRef.current = true;
      
      // Limpa a URL para ficar limpa, mas mantém o estado interno processando
      // router.replace("/code", { scroll: false }); 
      
      // Envia o prompt para o N8N
      sendMessage(startPrompt);
    }
  }, [startPrompt, sendMessage, router]);

  // --- 2. LÓGICA DE ROLAGEM AUTOMÁTICA ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- 3. DETECÇÃO DOS ARQUIVOS GERADOS ---
  // Pega a última mensagem do assistente que contenha arquivos
  const lastAssistantMessage = [...messages].reverse().find(
    m => m.role === 'assistant' && m.files && Object.keys(m.files).length > 0
  );

  // Se tiver arquivos novos da IA, usa eles. Se não, usa um objeto vazio ou um loading state.
  const currentFiles = lastAssistantMessage?.files || {};

  // Função de envio manual (chat contínuo)
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full bg-[#09090b]">
      
      {/* --- PAINEL DE CHAT (Esquerda) --- */}
      <div className="w-[400px] flex flex-col border-r border-zinc-800 bg-[#09090b] shrink-0 h-full">
        
        {/* Header do Chat */}
        <div className="h-12 border-b border-zinc-800 flex items-center px-4 font-semibold text-sm text-zinc-200 bg-[#09090b]">
          <Sparkles size={16} className="mr-2 text-blue-500" />
          AI Chat
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* Se não houver mensagens e não estiver carregando (estado zero real) */}
          {messages.length === 0 && !isLoading && !startPrompt && (
            <div className="text-center text-zinc-500 mt-10 text-sm">
              <p>Aguardando instruções...</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
               <span className={cn("text-[10px] font-bold uppercase tracking-wider", msg.role === 'user' ? "text-zinc-500" : "text-blue-400")}>
                 {msg.role === 'user' ? 'Você' : 'AI Architect'}
               </span>
               <div className={cn(
                 "p-3 rounded-lg text-sm leading-relaxed max-w-[90%]",
                 msg.role === 'user' 
                   ? "bg-zinc-800 text-zinc-200 rounded-tr-sm" 
                   : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm"
               )}>
                 {/* Renderização simples do texto. Se quiser markdown completo, use react-markdown */}
                 {msg.content}
               </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col gap-2 items-start">
               <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">AI Architect</span>
               <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-zinc-400 flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin text-blue-500" />
                 Gerando código e estrutura...
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-[#09090b]">
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva alterações ou novos requisitos..."
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none h-[100px] pr-12 transition-all"
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
               <button className="text-zinc-500 hover:text-zinc-300 disabled:opacity-50">
                 <Paperclip size={18} />
               </button>
               <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white p-1.5 rounded-lg transition-colors"
               >
                 {isLoading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ÁREA DO CÓDIGO (Direita) --- */}
      <div className="flex-1 bg-[#131314] overflow-hidden flex flex-col relative">
        {/* Se tiver arquivos, mostra o viewer. Se não, mostra um placeholder ou loading */}
        {Object.keys(currentFiles).length > 0 ? (
           <CodeViewer files={currentFiles} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 bg-[#131314]">
             {isLoading ? (
               <>
                 <Loader2 size={40} className="animate-spin text-blue-500 opacity-50" />
                 <p className="text-sm font-medium animate-pulse">Construindo seu projeto...</p>
               </>
             ) : (
               <>
                 <AlertCircle size={40} className="text-zinc-700" />
                 <p className="text-sm">Nenhum código gerado ainda.</p>
               </>
             )}
          </div>
        )}
      </div>

    </div>
  );
}