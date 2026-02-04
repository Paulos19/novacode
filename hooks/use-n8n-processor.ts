"use client";

import { useState, useRef } from "react";

// --- Definição dos Tipos ---
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

// Payload simplificado para arquitetura Stateful (Redis)
interface N8nPayload {
  prompt: string;
  sessionId: string;
  config?: {
    userId: string;
  };
}

// Utilitário para extrair código (exportado para ser usado na UI)
export function extractCodeFromMessage(content: string): string | null {
  const codeBlockRegex = /```(?:tsx|jsx|javascript|react|typescript)?([\s\S]*?)```/;
  const match = content.match(codeBlockRegex);
  return match ? match[1].trim() : null;
}

// Lê a variável de ambiente
const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export function useN8nProcessor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gera um ID de sessão único por recarga
  const sessionId = useRef(`sess_${Math.random().toString(36).substring(2, 9)}`).current;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. UI Otimista
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const payload: N8nPayload = {
        prompt: text,
        sessionId: sessionId,
        config: {
          userId: "paulo-dev-01",
        },
      };

      let aiContent = "";

      // --- CORREÇÃO DO BUG DE URL ---
      // Antes: WEBHOOK_URL.includes("") -> Sempre true
      // Agora: Verifica se não tem URL OU se é uma URL de placeholder
      const isInvalidUrl = !WEBHOOK_URL || WEBHOOK_URL.includes("SUA_URL_DO_WEBHOOK");

      if (isInvalidUrl) {
        console.warn("⚠️ MOCK MODE ATIVADO: Configure o .env.local corretamente.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        aiContent = `[MOCK] Erro de configuração. Verifique seu arquivo .env.local.\n\n` +
        "```tsx\nexport default function App() { return <div className='p-4 text-red-500 font-bold'>URL do N8N não configurada</div> }\n```";
      } else {
        // --- Requisição Real ao N8N ---
        // O TS reclama se WEBHOOK_URL for undefined, mas o 'if' acima já garante que existe.
        const response = await fetch(WEBHOOK_URL as string, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Erro N8N: ${response.statusText}`);

        const rawData = await response.json();
        
        // TRATAMENTO DE RETORNO (Array vs Objeto)
        // O seu n8n retorna [{ output: "..." }], este código trata isso:
        aiContent = Array.isArray(rawData) ? rawData[0].output : rawData.output;
      }

      if (!aiContent) throw new Error("Resposta vazia do N8N");

      // 3. Adiciona Resposta
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

    } catch (error) {
      console.error("Erro no processamento:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "🚨 Erro de conexão. Verifique se o workflow do n8n está ativo e a URL no .env.local está correta.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    hasMessages: messages.length > 0,
    sessionId 
  };
}