"use client";

import { useState, useRef } from "react";

// --- Tipos ---
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: Record<string, string>;
  timestamp: Date;
};

// --- FUNÇÃO DE REPARO DE JSON (NOVA) ---
// Tenta fechar aspas e chaves se o JSON tiver sido cortado por limite de tokens
function repairTruncatedJson(input: string): any {
  try {
    // Tentativa 1: O corte aconteceu dentro de uma string de arquivo (ex: "content": "import...)
    // Fecha aspas, fecha a chave do arquivo, fecha files e fecha o objeto root
    return JSON.parse(input + '"} }');
  } catch (e) {
    try {
      // Tentativa 2: O corte aconteceu logo após um valor ou chave, fora de string
      return JSON.parse(input + '} }');
    } catch (e2) {
      return null;
    }
  }
}

// --- FUNÇÃO DE PARSING BLINDADA (ATUALIZADA) ---
function robustJsonParse(input: string): { explanation: string; files: any } | null {
  if (typeof input !== 'string') return null;

  // 1. Tenta parse direto (Caminho feliz)
  try {
    return JSON.parse(input);
  } catch (e) {
    // Falhou parse direto, continua...
  }

  // 2. Tenta reparar assumindo que foi truncado (Caminho de erro comum em LLMs)
  const repaired = repairTruncatedJson(input);
  if (repaired && (repaired.files || repaired.explanation)) {
    console.warn("⚠️ JSON reparado automaticamente (estava truncado).");
    return repaired;
  }

  // 3. Algoritmo de busca reverso (Mantido para casos de lixo no final da string)
  const startIndex = input.indexOf('{');
  if (startIndex === -1) return null;

  const closingIndices: number[] = [];
  for (let i = input.length - 1; i > startIndex; i--) {
    if (input[i] === '}') {
      closingIndices.push(i);
    }
  }

  for (const endIndex of closingIndices) {
    const candidate = input.substring(startIndex, endIndex + 1);
    try {
      const result = JSON.parse(candidate);
      if (result && (result.files || result.explanation)) {
        return result;
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export function useN8nProcessor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Mantém o ID da sessão persistente
  const sessionId = useRef(`sess_${Math.random().toString(36).substring(2, 9)}`).current;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Mensagem do Usuário
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Verificação de URL
      const isInvalidUrl = !WEBHOOK_URL || WEBHOOK_URL.includes("SUA_URL_DO_WEBHOOK");
      
      let aiRawOutput = "";

      if (isInvalidUrl) {
        console.warn("⚠️ MOCK MODE ATIVADO");
        await new Promise((r) => setTimeout(r, 1500));
        aiRawOutput = JSON.stringify({
          explanation: "[MOCK] URL não configurada. Veja o .env.local",
          files: { "/app/page.tsx": "export default function Page() { return <div>Configure a URL</div> }" }
        });
      } else {
        // --- Requisição Real ---
        const response = await fetch(WEBHOOK_URL as string, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            sessionId: sessionId,
            config: { userId: "paulo-dev-01" }
          }),
        });

        if (!response.ok) throw new Error(`Erro N8N: ${response.statusText}`);

        const data = await response.json();
        // Garante que temos a string, independente se o n8n mandou array ou objeto
        aiRawOutput = Array.isArray(data) ? data[0].output : (data.output || JSON.stringify(data));
      }

      if (!aiRawOutput) throw new Error("Resposta vazia do N8N");

      // --- PARSING ESTRUTURADO ---
      let parsedData;
      
      // Se a resposta já vier como objeto (alguns webhooks fazem parse automático)
      if (typeof aiRawOutput === 'object') {
        parsedData = aiRawOutput;
      } else {
        parsedData = robustJsonParse(aiRawOutput as string);
      }

      // Se ainda assim falhar (ex: erro grave de sintaxe ou corte irreparável)
      if (!parsedData) {
        console.error("Falha fatal ao extrair JSON da resposta:", aiRawOutput);
        parsedData = { 
          explanation: typeof aiRawOutput === 'string' 
            ? aiRawOutput + "\n\n⚠️ (A resposta foi cortada. Tente pedir algo menor ou aumente os tokens no N8N.)" 
            : "Erro ao processar código.",
          files: null 
        };
      }

      // 4. Atualiza Chat
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: parsedData.explanation || "Aqui está o projeto.",
        files: parsedData.files || undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

    } catch (error) {
      console.error("Erro no processamento:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "🚨 Ocorreu um erro ao gerar o projeto. Tente novamente.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage, hasMessages: messages.length > 0, sessionId };
}