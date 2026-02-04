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

interface N8nPayload {
  prompt: string;
  sessionId: string;
  config?: { userId: string };
}

// Utilitário de fallback para extrair código (se necessário)
export function extractCodeFromMessage(content: string): string | null {
  const match = content.match(/```(?:tsx|jsx|javascript|react|typescript)?([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

// --- FUNÇÃO DE PARSING BLINDADA ---
// Tenta encontrar um JSON válido dentro de uma string suja, ignorando lixo antes e depois.
function robustJsonParse(input: string): { explanation: string; files: any } | null {
  if (typeof input !== 'string') return null;

  // 1. Encontra o início do JSON
  const startIndex = input.indexOf('{');
  if (startIndex === -1) return null;

  // 2. Coleta todas as posições de fechamento '}'
  const closingIndices: number[] = [];
  for (let i = input.length - 1; i > startIndex; i--) {
    if (input[i] === '}') {
      closingIndices.push(i);
    }
  }

  // 3. Tenta fazer o parse do maior para o menor (Backwards Seek)
  // Isso garante que pegamos o objeto completo, ignorando lixo no final (como markdown ou comentários)
  for (const endIndex of closingIndices) {
    const candidate = input.substring(startIndex, endIndex + 1);
    try {
      const result = JSON.parse(candidate);
      // Validação básica para garantir que não parseamos um pedaço inválido
      if (result && (result.files || result.explanation)) {
        return result;
      }
    } catch (e) {
      // Continua tentando com o próximo '}' anterior
      continue;
    }
  }

  return null;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export function useN8nProcessor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
        aiRawOutput = Array.isArray(data) ? data[0].output : data.output;
      }

      if (!aiRawOutput) throw new Error("Resposta vazia do N8N");

      // --- PARSING ESTRUTURADO ---
      let parsedData;
      
      // Tenta parse direto primeiro (mais rápido)
      try {
        parsedData = typeof aiRawOutput === 'object' ? aiRawOutput : JSON.parse(aiRawOutput);
      } catch (e) {
        console.log("JSON direto falhou, tentando limpeza robusta...");
        // Se falhar, usa o algoritmo de busca reverso
        parsedData = robustJsonParse(aiRawOutput as string);
      }

      // Se ainda assim falhar, trata como texto simples (erro de geração)
      if (!parsedData) {
        console.error("Falha fatal ao extrair JSON da resposta:", aiRawOutput);
        parsedData = { 
          explanation: typeof aiRawOutput === 'string' ? aiRawOutput : "Erro ao processar código.",
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