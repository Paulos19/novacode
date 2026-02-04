"use client";

import { useState, useRef, useEffect } from "react";

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
  sessionId: string; // A chave para o Redis recuperar o contexto
  config?: {
    userId: string;
  };
}

// Utilitário para extrair código (exportado para ser usado na UI)
export function extractCodeFromMessage(content: string): string | null {
  // Captura blocos typescript, javascript, react, tsx, jsx ou sem linguagem definida
  const codeBlockRegex = /```(?:tsx|jsx|javascript|react|typescript)?([\s\S]*?)```/;
  const match = content.match(codeBlockRegex);
  return match ? match[1].trim() : null;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;

export function useN8nProcessor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gera um ID de sessão único por recarga de página (memória volátil)
  // Para persistir entre recargas, você poderia salvar isso no localStorage
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
      // 2. Prepara Payload Leve (Apenas Prompt + SessionID)
      // O n8n usará o sessionId para buscar o histórico no Redis
      const payload: N8nPayload = {
        prompt: text,
        sessionId: sessionId,
        config: {
          userId: "paulo-dev-01",
        },
      };

      let aiContent = "";

      if (WEBHOOK_URL.includes("")) {
        console.warn("⚠️ MOCK MODE ATIVADO: Configure a URL do N8N.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Resposta Mockada com Texto + Código
        aiContent = `Aqui está o componente de Login que você pediu. Ele usa Tailwind e lucide-react.\n\n` +
        "```tsx\n" +
        "import React from 'react';\n" +
        "import { User } from 'lucide-react';\n" +
        "export default function App() { return <div className='p-10 text-white'><h1>Mock App</h1></div> }\n" +
        "```";
      } else {
        // --- Requisição Real ---
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Erro N8N: ${response.statusText}`);

        const rawData = await response.json();
        
        // TRATAMENTO DE RETORNO: Verifica se é Array ou Objeto
        // O n8n pode retornar [{ output: "..." }] ou { output: "..." }
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
        content: "🚨 Erro de conexão. Verifique se o workflow do n8n está ativo.",
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
    sessionId // Útil se você quiser mostrar o ID na UI para debug
  };
}