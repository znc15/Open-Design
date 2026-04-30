"use client";

import { useState } from "react";
import { Globe, Key, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";

export function SearchSettings() {
  const tavilyApiKey = useAppStore((s) => s.tavilyApiKey);
  const tavilyApiUrl = useAppStore((s) => s.tavilyApiUrl);
  const setTavilyApiKey = useAppStore((s) => s.setTavilyApiKey);
  const setTavilyApiUrl = useAppStore((s) => s.setTavilyApiUrl);
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground">
        配置联网搜索服务。使用 Tavily API 为 AI 提供实时网络搜索能力。
      </div>

      {/* API 地址 */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">API 地址</label>
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="https://api.tavily.com"
            value={tavilyApiUrl}
            onChange={(e) => setTavilyApiUrl(e.target.value)}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground/60">
          默认使用官方地址，支持自建代理或兼容 API 地址
        </p>
      </div>

      {/* API Key */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">API Key</label>
        <div className="flex items-center gap-2">
          <Key className="size-4 text-muted-foreground shrink-0" />
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="tvly-..."
              value={tavilyApiKey}
              onChange={(e) => setTavilyApiKey(e.target.value)}
              className="pr-9"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60">
          前往{" "}
          <a
            href="https://tavily.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            tavily.com
          </a>{" "}
          获取 API Key
        </p>
      </div>

      {/* 状态指示 */}
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        {tavilyApiKey ? (
          <>
            <Check className="size-4 text-green-500" />
            <span className="text-xs text-muted-foreground">
              API Key 已配置{tavilyApiUrl !== "https://api.tavily.com" ? ` · 自定义地址: ${tavilyApiUrl}` : ""}
            </span>
          </>
        ) : (
          <>
            <Globe className="size-4 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60">未配置 API Key，联网搜索不可用</span>
          </>
        )}
      </div>
    </div>
  );
}
