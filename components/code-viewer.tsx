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

// --- TEMA CUSTOMIZADO (Dark Zinc / Shadcn Style) ---
const customTheme = {
  colors: {
    surface1: "#09090b", // zinc-950
    surface2: "#18181b", // zinc-900 (Sidebar)
    surface3: "#27272a", // zinc-800 (Border)
    clickable: "#a1a1aa", // zinc-400
    base: "#e4e4e7",      // zinc-200
    disabled: "#52525b",  // zinc-600
    hover: "#f4f4f5",     // zinc-100
    accent: "#3b82f6",    // blue-500
    error: "#ef4444",
    errorSurface: "#2a0a0a",
  },
  syntax: {
    plain: "#e4e4e7",
    comment: { color: "#71717a", fontStyle: "italic" as const },
    keyword: "#c084fc", // purple-400
    tag: "#60a5fa",     // blue-400
    punctuation: "#71717a",
    definition: "#f472b6", // pink-400
    property: "#93c5fd",   // blue-300
    static: "#fbbf24",     // amber-400
    string: "#34d399",     // emerald-400
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    size: "13px",
    lineHeight: "20px",
  },
};

// Scrollbar fina e escura
const scrollbarStyles = "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#09090b] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 transition-colors";

// --- TOOLBAR COMPONENT ---
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
    <div className="flex shrink-0 items-center justify-between px-4 py-2 border-b border-zinc-800 bg-[#09090b] select-none h-12">
      <div className="flex items-center gap-3">
         <button 
           onClick={() => setShowSidebar(!showSidebar)}
           className="text-zinc-500 hover:text-zinc-200 transition-colors"
           title="Toggle Explorer"
         >
            {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
         </button>

         <div className="h-4 w-[1px] bg-zinc-800" />

         {/* View Mode Switcher */}
         <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button 
              onClick={() => setViewMode('preview')}
              className={cn("px-3 py-1 text-xs rounded-md flex items-center gap-2 transition-all font-medium", viewMode === 'preview' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Eye size={14} /> <span className="hidden sm:inline">Preview</span>
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={cn("hidden md:flex px-3 py-1 text-xs rounded-md items-center gap-2 transition-all font-medium", viewMode === 'split' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Columns size={14} /> <span className="hidden sm:inline">Split</span>
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={cn("px-3 py-1 text-xs rounded-md flex items-center gap-2 transition-all font-medium", viewMode === 'code' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Code2 size={14} /> <span className="hidden sm:inline">Code</span>
            </button>
         </div>
      </div>

      <div className="flex items-center gap-3">
         {sandpack.status === 'idle' ? (
           <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-medium text-emerald-500">Ready</span>
           </div>
         ) : (
             <RefreshCw size={14} className="animate-spin text-amber-500" />
         )}

         <button 
           onClick={handleRefresh}
           className={cn("hover:bg-zinc-800 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 transition-all", isRefreshing && "animate-spin")}
         >
           <RefreshCw size={16} />
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
  
  // Resize State
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- ARQUIVOS BASE DO VITE ---
  const templateFiles: Record<string, string> = {
    "/vite.config.ts": `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; export default defineConfig({ plugins: [react()] });`,
    "/tailwind.config.js": `/** @type {import('tailwindcss').Config} */ export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [], }`,
    "/postcss.config.js": `export default { plugins: { tailwindcss: {}, autoprefixer: {} }, }`,
    "/index.html": `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vite App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`,
    "/src/main.tsx": `import { StrictMode } from 'react'; import { createRoot } from 'react-dom/client'; import './index.css'; import App from './App'; createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);`,
    "/src/index.css": `@tailwind base; @tailwind components; @tailwind utilities; :root { --background: 255 255 255; --foreground: 23 23 23; } @media (prefers-color-scheme: dark) { :root { --background: 10 10 10; --foreground: 237 237 237; } } body { background-color: rgb(var(--background)); color: rgb(var(--foreground)); font-family: system-ui, sans-serif; }`,
    "/src/App.tsx": `export default function App() { return (<div className="flex h-screen items-center justify-center bg-zinc-950 text-white"><h1 className="text-xl">Carregando aplicação...</h1></div>) }`
  };

  const defaultPackageJson = {
    name: "vite-react-starter",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" },
    dependencies: {
      "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "latest", "clsx": "latest", "tailwind-merge": "latest", "class-variance-authority": "latest", "react-router-dom": "^6.20.0"
    },
    devDependencies: {
      "@types/react": "^18.2.15", "@types/react-dom": "^18.2.7", "@vitejs/plugin-react": "^4.0.3", "vite": "4.4.5", "esbuild-wasm": "0.18.20", "typescript": "^5.0.2", "tailwindcss": "^3.3.3", "postcss": "^8.4.27", "autoprefixer": "^10.4.14"
    }
  };

  // Normalização de caminhos (para evitar erros de path)
  const normalizeFiles = (inputFiles: Record<string, string>) => {
    const normalized: Record<string, string> = {};
    Object.keys(inputFiles).forEach(path => {
      // Ignora arquivos de config do Next.js se vierem da IA
      if (["/next.config.ts", "/next.config.js", "/app/page.tsx", "/app/layout.tsx"].includes(path)) return;

      if (["/package.json", "/vite.config.ts", "/index.html"].includes(path)) {
        normalized[path] = inputFiles[path];
        return;
      }
      if (path === "/App.tsx" || path === "App.tsx") {
        normalized["/src/App.tsx"] = inputFiles[path];
        return;
      }
      if (!path.startsWith("/src/") && !path.startsWith("/public/") && !path.includes("config")) {
         // Tenta inferir que arquivos soltos vão para src
         if (path.endsWith(".tsx") || path.endsWith(".ts") || path.endsWith(".css")) {
            normalized[`/src${path.startsWith('/') ? path : '/' + path}`] = inputFiles[path];
            return;
         }
      }
      normalized[path] = inputFiles[path];
    });
    return normalized;
  };

  const processedFiles = normalizeFiles(files);
  const finalFiles = { ...templateFiles, ...processedFiles };

  // Merge do package.json inteligente
  if (files && files["/package.json"]) {
    try {
      const aiPkg = JSON.parse(files["/package.json"]);
      const mergedPkg = {
        ...defaultPackageJson,
        ...aiPkg,
        dependencies: { ...defaultPackageJson.dependencies, ...(aiPkg.dependencies || {}) },
        devDependencies: { ...defaultPackageJson.devDependencies, ...(aiPkg.devDependencies || {}) }
      };
      // Força versões compatíveis com Sandpack
      mergedPkg.devDependencies["vite"] = "4.4.5";
      mergedPkg.devDependencies["esbuild-wasm"] = "0.18.20";
      finalFiles["/package.json"] = JSON.stringify(mergedPkg, null, 2);
    } catch (e) {
      finalFiles["/package.json"] = JSON.stringify(defaultPackageJson, null, 2);
    }
  } else {
    finalFiles["/package.json"] = JSON.stringify(defaultPackageJson, null, 2);
  }

  // Lógica de Resize
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
    <div className="h-full w-full flex flex-col bg-[#09090b] text-zinc-300">
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
          
          <SandpackToolbar 
             viewMode={viewMode} 
             setViewMode={setViewMode} 
             showSidebar={showSidebar}
             setShowSidebar={setShowSidebar}
          />

          <div ref={containerRef} className="flex-1 flex overflow-hidden relative bg-[#09090b]">
            
            {/* 1. Sidebar (Explorer) */}
            <div className={cn(
               "border-r border-zinc-800 bg-[#09090b] flex flex-col transition-all duration-300 overflow-hidden shrink-0",
               showSidebar ? "w-[220px] opacity-100" : "w-0 opacity-0"
            )}>
               <div className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/50 shrink-0">
                 <FileJson size={12} /> Explorer
               </div>
               <div className={cn("flex-1", scrollbarStyles)}>
                 <SandpackFileExplorer />
               </div>
            </div>

            {/* 2. Área Principal (Editor + Preview) */}
            <div className="flex-1 flex relative overflow-hidden">
                
                {/* EDITOR CODE */}
                <div 
                  className={cn("h-full transition-all duration-200", viewMode === 'preview' ? "hidden" : "block")}
                  style={{ width: viewMode === 'split' ? `${leftWidth}%` : '100%' }}
                >
                  <div className={cn("h-full", scrollbarStyles)}>
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
                </div>

                {/* DRAG HANDLE (Estilo VS Code) */}
                {viewMode === 'split' && (
                  <div
                    onMouseDown={startResizing}
                    className={cn(
                      "w-1 z-50 cursor-col-resize hover:bg-blue-500 transition-colors shrink-0 bg-zinc-800 relative group",
                      isDragging && "bg-blue-600"
                    )}
                  />
                )}

                {/* PREVIEW */}
                <div 
                   className={cn(
                    "h-full overflow-hidden bg-white transition-all duration-200 relative", 
                    viewMode === 'code' ? "hidden" : "block"
                   )}
                   style={{ width: viewMode === 'split' ? `${100 - leftWidth}%` : '100%' }}
                >
                   {/* Overlay de proteção durante o drag */}
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