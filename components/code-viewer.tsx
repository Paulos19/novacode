"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  SandpackProvider, 
  SandpackCodeEditor, 
  SandpackPreview, 
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { 
  Code2, 
  Eye, 
  Columns, 
  RefreshCw, 
  FileJson,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TEMA VS CODE DARK (Ajustado para Shadcn) ---
const customTheme = {
  colors: {
    surface1: "#1e1e1e", // Editor BG (VS Code Default)
    surface2: "#18181b", // Sidebar BG
    surface3: "#2b2b2b", // Border/Active
    clickable: "#cccccc", // Text Color
    base: "#e4e4e7",      
    disabled: "#858585",  
    hover: "#2a2d2e",     
    accent: "#3b82f6",    
    error: "#f48771",
    errorSurface: "#2a0a0a",
  },
  syntax: {
    plain: "#d4d4d4",
    comment: { color: "#6a9955", fontStyle: "italic" as const },
    keyword: "#c586c0", 
    tag: "#569cd6",     
    punctuation: "#d4d4d4",
    definition: "#dcdcaa", 
    property: "#9cdcfe",   
    static: "#ce9178",     
    string: "#ce9178",     
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    size: "13px",
    lineHeight: "20px",
  },
};

// --- TOOLBAR ---
const SandpackToolbar = ({ 
  viewMode, 
  setViewMode,
  showSidebar,
  setShowSidebar
}: { 
  viewMode: 'preview' | 'code' | 'split', 
  setViewMode: (v: 'preview' | 'code' | 'split') => void,
  showSidebar: boolean,
  setShowSidebar: (v: boolean) => void
}) => {
  const { sandpack } = useSandpack();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    sandpack.runSandpack();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-[#18181b] select-none h-10 flex-none z-20">
      <div className="flex items-center gap-2">
         <button 
           onClick={() => setShowSidebar(!showSidebar)}
           className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md transition-colors"
           title="Toggle File Explorer"
         >
            {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
         </button>

         <div className="h-4 w-[1px] bg-zinc-700/50 mx-1" />

         <div className="flex bg-[#252526] rounded-md p-0.5 border border-zinc-700/50">
            <button 
              onClick={() => setViewMode('preview')}
              className={cn("px-2.5 py-1 text-[11px] font-medium rounded-sm flex items-center gap-1.5 transition-all", viewMode === 'preview' ? "bg-zinc-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200")}
            >
              <Eye size={12} /> <span className="hidden sm:inline">Preview</span>
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={cn("hidden md:flex px-2.5 py-1 text-[11px] font-medium rounded-sm items-center gap-1.5 transition-all", viewMode === 'split' ? "bg-zinc-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200")}
            >
              <Columns size={12} /> <span className="hidden sm:inline">Split</span>
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={cn("px-2.5 py-1 text-[11px] font-medium rounded-sm flex items-center gap-1.5 transition-all", viewMode === 'code' ? "bg-zinc-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200")}
            >
              <Code2 size={12} /> <span className="hidden sm:inline">Code</span>
            </button>
         </div>
      </div>

      <div className="flex items-center gap-2">
         {sandpack.status === 'idle' ? (
           <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 px-2 bg-emerald-500/10 rounded-full h-5 border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="font-medium">Ready</span>
           </div>
         ) : (
           <div className="text-[10px] text-amber-400 flex items-center gap-1.5 px-2 bg-amber-500/10 rounded-full h-5 border border-amber-500/20">
             <RefreshCw size={10} className="animate-spin" />
             <span>Building...</span>
           </div>
         )}

         <button 
           onClick={handleRefresh}
           className={cn("p-1.5 hover:bg-zinc-700/50 rounded-md text-zinc-400 hover:text-white transition-all", isRefreshing && "animate-spin")}
           title="Restart Container"
         >
           <RefreshCw size={14} />
         </button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

interface CodeViewerProps {
  files: Record<string, string>;
}

export function CodeViewer({ files }: CodeViewerProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('split');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Template Vite Base
  const templateFiles: Record<string, string> = {
    "/vite.config.ts": `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; export default defineConfig({ plugins: [react()] })`,
    "/tailwind.config.js": `/** @type {import('tailwindcss').Config} */ export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [], }`,
    "/postcss.config.js": `export default { plugins: { tailwindcss: {}, autoprefixer: {} }, }`,
    "/index.html": `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vite App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`,
    "/src/main.tsx": `import { StrictMode } from 'react'; import { createRoot } from 'react-dom/client'; import './index.css'; import App from './App'; createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>,)`,
    "/src/index.css": `@tailwind base; @tailwind components; @tailwind utilities; :root { --background: 255 255 255; --foreground: 23 23 23; } @media (prefers-color-scheme: dark) { :root { --background: 10 10 10; --foreground: 237 237 237; } } body { background-color: rgb(var(--background)); color: rgb(var(--foreground)); font-family: system-ui, sans-serif; }`,
    "/src/App.tsx": `export default function App() { return (<div className="flex h-screen items-center justify-center bg-zinc-950 text-white"><h1 className="text-2xl font-bold">Carregando...</h1></div>) }`
  };

  const defaultPackageJson = {
    name: "vite-react-starter", private: true, version: "0.0.0", type: "module",
    scripts: { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" },
    dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "latest", "clsx": "latest", "tailwind-merge": "latest", "class-variance-authority": "latest", "react-router-dom": "^6.20.0" },
    devDependencies: { "@types/react": "^18.2.15", "@types/react-dom": "^18.2.7", "@vitejs/plugin-react": "^4.0.3", "vite": "4.4.5", "esbuild-wasm": "0.18.20", "typescript": "^5.0.2", "tailwindcss": "^3.3.3", "postcss": "^8.4.27", "autoprefixer": "^10.4.14" }
  };

  const normalizeFiles = (inputFiles: Record<string, string>) => {
    const normalized: Record<string, string> = {};
    Object.keys(inputFiles).forEach(path => {
      if (["/package.json", "/vite.config.ts"].includes(path)) { normalized[path] = inputFiles[path]; return; }
      if (path === "/App.tsx") { normalized["/src/App.tsx"] = inputFiles[path]; return; }
      if (path.startsWith("/components/") || path.startsWith("/lib/") || path.startsWith("/hooks/") || path.startsWith("/utils/")) {
         normalized[`/src${path}`] = inputFiles[path]; 
         return; 
      }
      normalized[path] = inputFiles[path];
    });
    return normalized;
  };

  const processedFiles = normalizeFiles(files);
  let finalFiles: Record<string, string> = { ...templateFiles, ...processedFiles };

  ["/next.config.ts", "/next.config.js", "/app/page.tsx", "/app/layout.tsx", "/pages/index.js"].forEach(key => {
    if (finalFiles[key]) delete finalFiles[key];
  });

  if (files && files["/package.json"]) {
    try {
      const aiPkg = JSON.parse(files["/package.json"]);
      const mergedPkg = { ...defaultPackageJson, ...aiPkg, dependencies: { ...defaultPackageJson.dependencies, ...(aiPkg.dependencies || {}) }, devDependencies: { ...defaultPackageJson.devDependencies, ...(aiPkg.devDependencies || {}) } };
      mergedPkg.devDependencies["vite"] = "4.4.5";
      mergedPkg.devDependencies["esbuild-wasm"] = "0.18.20";
      finalFiles["/package.json"] = JSON.stringify(mergedPkg, null, 2);
    } catch (e) {
      finalFiles["/package.json"] = JSON.stringify(defaultPackageJson, null, 2);
    }
  } else {
    finalFiles["/package.json"] = JSON.stringify(defaultPackageJson, null, 2);
  }

  // Lógica de Redimensionamento
  const startResizing = useCallback(() => setIsDragging(true), []);
  const stopResizing = useCallback(() => setIsDragging(false), []);

  const resize = useCallback((e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newLeftWidth > 15 && newLeftWidth < 85) setLeftWidth(newLeftWidth);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative">
      <SandpackProvider
        template="vite-react-ts"
        theme={customTheme}
        files={finalFiles}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          classes: { 
            "sp-wrapper": "h-full flex flex-col",
            "sp-layout": "h-full flex flex-1 overflow-hidden",
          }
        }}
        customSetup={{
          dependencies: defaultPackageJson.dependencies,
          devDependencies: defaultPackageJson.devDependencies
        }}
      >
          {/* Header */}
          <SandpackToolbar 
             viewMode={viewMode} 
             setViewMode={setViewMode} 
             showSidebar={showSidebar}
             setShowSidebar={setShowSidebar}
          />

          {/* Área Principal - Usa flex-1 e min-h-0 para garantir scroll correto */}
          <div ref={containerRef} className="flex-1 flex overflow-hidden relative bg-[#1e1e1e] min-h-0">
            
            {/* Sidebar (Explorer) */}
            <div className={cn(
               "border-r border-zinc-800 bg-[#18181b] flex flex-col transition-all duration-300 overflow-hidden",
               showSidebar ? "w-[200px] opacity-100" : "w-0 opacity-0"
            )}>
               <div className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/50 flex-none bg-[#18181b]">
                 <FileJson size={12} /> Project Files
               </div>
               
               {/* Aplicando a scrollbar VS Code aqui */}
               <div className="flex-1 overflow-y-auto vscode-scrollbar">
                 <SandpackFileExplorer />
               </div>
            </div>

            {/* Container Central (Editor + Preview) */}
            <div className="flex-1 flex relative overflow-hidden h-full">
                
                {/* Editor Code */}
                <div 
                  className={cn(
                    "h-full overflow-hidden transition-all duration-200 flex flex-col", 
                    viewMode === 'preview' ? "hidden" : "block"
                  )}
                  style={{ width: viewMode === 'split' ? `${leftWidth}%` : '100%' }}
                >
                  {/* O SandpackCodeEditor preenche 100% da altura e usa a scrollbar estilizada globalmente no CSS */}
                  <SandpackCodeEditor 
                    showTabs
                    showLineNumbers
                    showInlineErrors
                    wrapContent
                    closableTabs
                    initMode="user-visible"
                    style={{ height: "100%", fontFamily: '"JetBrains Mono", monospace' }}
                  />
                </div>

                {/* Handle Redimensionamento */}
                {viewMode === 'split' && (
                  <div
                    onMouseDown={startResizing}
                    className={cn(
                      "w-1 z-50 cursor-col-resize flex items-center justify-center hover:bg-blue-500 transition-colors group relative bg-zinc-800 border-l border-zinc-900",
                      isDragging && "bg-blue-500"
                    )}
                  />
                )}

                {/* Preview */}
                <div 
                   className={cn(
                    "h-full overflow-hidden bg-white transition-all duration-200 relative", 
                    viewMode === 'code' ? "hidden" : "block"
                   )}
                   style={{ width: viewMode === 'split' ? `${100 - leftWidth}%` : '100%' }}
                >
                   {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
                   
                   <SandpackPreview 
                     showNavigator={true}
                     showOpenInCodeSandbox={false}
                     showRefreshButton={false} 
                     style={{ height: "100%" }}
                   />
                </div>

            </div>
          </div>
      </SandpackProvider>
    </div>
  );
}