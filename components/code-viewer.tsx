"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { amethyst } from "@codesandbox/sandpack-themes";

interface CodeViewerProps {
  code: string;
}

export function CodeViewer({ code }: CodeViewerProps) {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      <Sandpack
        theme={amethyst}
        template="react-ts"
        files={{
          "/App.tsx": code,
        }}
        options={{
          showNavigator: true, // Mostra barra de URL fake
          showLineNumbers: true,
          showTabs: true, 
          externalResources: ["https://cdn.tailwindcss.com"], // Tailwind via CDN para o preview rápido
        }}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "framer-motion": "latest",
            "clsx": "latest",
            "tailwind-merge": "latest",
            "date-fns": "latest" // Muito comum em dashboards
          },
        }}
      />
    </div>
  );
}