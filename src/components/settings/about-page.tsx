"use client";

import { ExternalLink, Heart } from "lucide-react";

const APP_VERSION = "0.1.0";

export function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm ring-1 ring-primary/10">
          <svg className="size-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">OpenDesign</h2>
        <p className="text-sm text-muted-foreground mt-1">AI 驱动的 UI 设计工具</p>
        <p className="text-xs text-muted-foreground mt-1">版本 {APP_VERSION}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="font-medium text-sm mb-2">功能特性</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• AI 生成前端 UI 代码</li>
            <li>• 实时预览和代码编辑</li>
            <li>• 多模型支持（OpenAI、Ollama、Anthropic）</li>
            <li>• Skill 系统定制生成风格</li>
            <li>• 导出 Figma 设计稿</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="font-medium text-sm mb-2">技术栈</h3>
          <div className="flex flex-wrap gap-2">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Zustand", "Monaco Editor"].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="font-medium text-sm mb-2">开源协议</h3>
          <p className="text-sm text-muted-foreground">
            本项目基于 MIT 协议开源，欢迎贡献代码和反馈问题。
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.976-.399 3-.405 1.024.006 2.043.139 3 .405 2.293-1.552 3.301-1.23 3.301-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
          <ExternalLink className="size-3" />
        </a>
        <span className="text-border">•</span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Heart className="size-4 text-red-500" />
          用心打造
        </span>
      </div>
    </div>
  );
}
