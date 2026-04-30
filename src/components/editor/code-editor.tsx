"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";

/** 语言切换选项 */
const LANGUAGE_OPTIONS = [
  { value: "html" as const, label: "HTML" },
  { value: "css" as const, label: "CSS" },
  { value: "javascript" as const, label: "JS" },
];

export function CodeEditor() {
  const editorCode = useCanvasStore((s) => s.editorCode);
  const editorLanguage = useCanvasStore((s) => s.editorLanguage);
  const setEditorCode = useCanvasStore((s) => s.setEditorCode);
  const setEditorLanguage = useCanvasStore((s) => s.setEditorLanguage);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleLanguageChange = useCallback(
    (lang: typeof editorLanguage) => {
      setEditorLanguage(lang);
    },
    [setEditorLanguage]
  );

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* 语言切换标签栏 */}
      <div className="flex items-center gap-0.5 border-b border-zinc-800 bg-zinc-900 px-3 py-1">
        {LANGUAGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={cn(
              "rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-all",
              editorLanguage === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            )}
            onClick={() => handleLanguageChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-zinc-600">
          {editorCode.split("\n").length} 行
        </span>
      </div>

      {/* 编辑器区域 */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* 行号 */}
          <div className="flex-shrink-0 select-none border-r border-zinc-800 bg-zinc-900/80 px-2.5 py-3 text-right font-mono text-[11px] leading-5 text-zinc-600">
            {editorCode.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* 代码输入 */}
          <textarea
            ref={editorRef}
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            className="h-full w-full resize-none border-0 bg-transparent p-3 font-mono text-[13px] leading-5 text-zinc-200 outline-none placeholder:text-zinc-700 caret-amber-500 selection:bg-amber-500/20"
            spellCheck={false}
            placeholder="在此输入代码..."
          />
        </div>
      </div>
    </div>
  );
}
