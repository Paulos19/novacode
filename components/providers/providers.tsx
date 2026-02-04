"use client";

import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {/* Aqui você poderá adicionar ThemeProvider, TooltipProvider, etc. no futuro */}
      {children}
    </SessionProvider>
  );
}