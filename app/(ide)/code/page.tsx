"use client";

import { useState } from "react";
import { SendHorizontal, Paperclip } from "lucide-react";
import { CodeViewer } from "@/components/code-viewer"; // O componente adaptado abaixo

export default function CodePage() {
  // Exemplo de estado local para o chat
  const [input, setInput] = useState("");

  // Arquivos mockados (vêm da sua lógica de IA)
  const files = {
    "/package.json": JSON.stringify({ dependencies: { "lucide-react": "latest" } }, null, 2)
  };

  return (
    <div className="flex h-full w-full">
      
      {/* --- PAINEL DE CHAT (Esquerda) --- */}
      <div className="w-[400px] flex flex-col border-r border-zinc-800 bg-[#09090b] shrink-0">
        
        {/* Lista de Mensagens (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Mensagem da IA */}
          <div className="flex flex-col gap-1">
             <span className="text-xs font-bold text-blue-400">AI Assistant</span>
             <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-zinc-300 leading-relaxed">
               Aqui está o projeto inicializado com Vite e React. Adicionei o Tailwind e configurei o layout básico. Como posso ajudar agora?
             </div>
          </div>

          {/* Mensagem do User */}
          <div className="flex flex-col gap-1 items-end">
             <span className="text-xs font-bold text-zinc-500">Você</span>
             <div className="bg-zinc-800 p-3 rounded-lg text-sm text-zinc-200 leading-relaxed">
               Adicione um botão de contagem.
             </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-[#09090b]">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva a alteração..."
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-[100px] pr-10"
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
               <button className="text-zinc-500 hover:text-zinc-300">
                 <Paperclip size={18} />
               </button>
               <button className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors">
                 <SendHorizontal size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ÁREA DO CÓDIGO (Direita - Ocupa o resto) --- */}
      <div className="flex-1 bg-[#131314] overflow-hidden">
        <CodeViewer files={files} />
      </div>

    </div>
  );
}