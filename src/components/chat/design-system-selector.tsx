"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Palette, Search, Check, ExternalLink } from "lucide-react";

/** Design System 条目 */
interface DesignSystemEntry {
  id: string;
  name: string;
  category: string;
  colors: string[];
}

/** 内置 Design System 列表（精选 72 套中的代表） */
const DESIGN_SYSTEMS: DesignSystemEntry[] = [
  // AI & LLM
  { id: "claude", name: "Claude", category: "AI & LLM", colors: ["#D97757", "#F4F1ED", "#1A1A1A", "#6B6B6B"] },
  { id: "openai", name: "OpenAI", category: "AI & LLM", colors: ["#10A37F", "#1A1A2E", "#FFFFFF", "#6B7280"] },
  { id: "cohere", name: "Cohere", category: "AI & LLM", colors: ["#39594D", "#F5F5F0", "#1A1A1A", "#8B8B8B"] },
  { id: "mistral-ai", name: "Mistral", category: "AI & LLM", colors: ["#F97316", "#000000", "#FFFFFF", "#6B7280"] },
  { id: "x-ai", name: "X.AI", category: "AI & LLM", colors: ["#6366F1", "#0F0F0F", "#FFFFFF", "#9CA3AF"] },
  // 开发者工具
  { id: "linear-app", name: "Linear", category: "开发者工具", colors: ["#5E6AD2", "#1B1B1F", "#FFFFFF", "#8B8B8D"] },
  { id: "vercel", name: "Vercel", category: "开发者工具", colors: ["#000000", "#FFFFFF", "#888888", "#EAEAEA"] },
  { id: "stripe", name: "Stripe", category: "开发者工具", colors: ["#635BFF", "#F6F9FC", "#1A1A1A", "#6B7C93"] },
  { id: "cursor", name: "Cursor", category: "开发者工具", colors: ["#00ADAD", "#1A1A1A", "#FFFFFF", "#6B7280"] },
  { id: "supabase", name: "Supabase", category: "开发者工具", colors: ["#3ECF8E", "#1C1C1C", "#FFFFFF", "#6B7280"] },
  { id: "figma", name: "Figma", category: "开发者工具", colors: ["#A259FF", "#F5F5F5", "#1E1E1E", "#7B7B7B"] },
  { id: "posthog", name: "PostHog", category: "开发者工具", colors: ["#F9BD2B", "#1A1A1A", "#FFFFFF", "#6B7280"] },
  { id: "sentry", name: "Sentry", category: "开发者工具", colors: ["#362D59", "#F5F5F5", "#1A1A1A", "#7B7B7B"] },
  // 生产力
  { id: "notion", name: "Notion", category: "生产力", colors: ["#000000", "#FFFFFF", "#9B9B9B", "#EAEAEA"] },
  { id: "apple", name: "Apple", category: "生产力", colors: ["#0071E3", "#F5F5F7", "#1D1D1F", "#86868B"] },
  { id: "raycast", name: "Raycast", category: "生产力", colors: ["#FF6363", "#1A1A1A", "#FFFFFF", "#6B7280"] },
  { id: "intercom", name: "Intercom", category: "生产力", colors: ["#1F8DED", "#FAFAFA", "#1A1A1A", "#6B7280"] },
  // 金融科技
  { id: "coinbase", name: "Coinbase", category: "金融科技", colors: ["#0052FF", "#FFFFFF", "#1A1A1A", "#6B7280"] },
  { id: "revolut", name: "Revolut", category: "金融科技", colors: ["#0073FF", "#F5F5F5", "#1A1A1A", "#6B7280"] },
  // 电商/出行
  { id: "airbnb", name: "Airbnb", category: "电商/出行", colors: ["#FF5A5F", "#FFFFFF", "#222222", "#737373"] },
  { id: "shopify", name: "Shopify", category: "电商/出行", colors: ["#008060", "#F6F6F7", "#1A1A1A", "#6B7280"] },
  { id: "uber", name: "Uber", category: "电商/出行", colors: ["#000000", "#FFFFFF", "#545454", "#E0E0E0"] },
  // 汽车
  { id: "tesla", name: "Tesla", category: "汽车", colors: ["#CC0000", "#1A1A1A", "#FFFFFF", "#6B7280"] },
  { id: "bmw", name: "BMW", category: "汽车", colors: ["#0066B1", "#F5F5F5", "#1A1A1A", "#6B7280"] },
  // 媒体
  { id: "spotify", name: "Spotify", category: "媒体", colors: ["#1DB954", "#121212", "#FFFFFF", "#B3B3B3"] },
  // 其他
  { id: "nvidia", name: "NVIDIA", category: "其他", colors: ["#76B900", "#1A1A1A", "#FFFFFF", "#6B7280"] },
  { id: "spacex", name: "SpaceX", category: "其他", colors: ["#000000", "#FFFFFF", "#7B7B7B", "#E0E0E0"] },
  // 默认
  { id: "default", name: "Neutral Modern", category: "默认", colors: ["#2563EB", "#FFFFFF", "#0F172A", "#94A3B8"] },
  { id: "warm-editorial", name: "Warm Editorial", category: "默认", colors: ["#DC2626", "#FFFBEB", "#1C1917", "#A8A29E"] },
];

/** 按类别分组 */
function groupByCategory(systems: DesignSystemEntry[]): Map<string, DesignSystemEntry[]> {
  const map = new Map<string, DesignSystemEntry[]>();
  for (const system of systems) {
    const existing = map.get(system.category) || [];
    existing.push(system);
    map.set(system.category, existing);
  }
  return map;
}

export function DesignSystemSelector({
  activeSystemId,
  onSelect,
}: {
  activeSystemId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? DESIGN_SYSTEMS.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase())
      )
    : DESIGN_SYSTEMS;

  const grouped = groupByCategory(filtered);
  const activeSystem = DESIGN_SYSTEMS.find((s) => s.id === activeSystemId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 h-7 rounded-md border border-input bg-background px-2.5 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Palette className="size-3.5" />
        <span className="truncate max-w-[80px]">
          {activeSystem?.name || "Design System"}
        </span>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        {/* 搜索 */}
        <div className="p-2 border-b border-border/60">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索 Design System..."
              className="h-7 pl-7 text-sm"
            />
          </div>
        </div>

        {/* 列表 */}
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {Array.from(grouped.entries()).map(([category, systems]) => (
              <div key={category} className="mb-3">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-1">{category}</p>
                <div className="space-y-1">
                  {systems.map((system) => (
                    <button
                      key={system.id}
                      onClick={() => {
                        onSelect(system.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                        activeSystemId === system.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {/* 色卡 */}
                      <div className="flex shrink-0 gap-0.5">
                        {system.colors.map((color, i) => (
                          <div
                            key={i}
                            className="size-3 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm truncate">{system.name}</span>
                      {activeSystemId === system.id && (
                        <Check className="size-3 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}