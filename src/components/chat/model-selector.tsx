"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2, ArrowLeft, Globe, Bot, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useAppStore } from "@/stores/app-store";
import type { ModelConfig } from "@/types/chat";

/** 提供者默认地址 */
const PROVIDER_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  ollama: "http://localhost:11434",
  anthropic: "https://api.anthropic.com",
};

type View = "list" | "add";

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
  });

  const activeModel = useChatStore((state) => state.activeModel);
  const savedModels = useChatStore((state) => state.savedModels);
  const setActiveModel = useChatStore((state) => state.setActiveModel);
  const addSavedModel = useChatStore((state) => state.addSavedModel);
  const removeSavedModel = useChatStore((state) => state.removeSavedModel);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  function handleSelectModel(model: ModelConfig) {
    setActiveModel(model);
    setOpen(false);
  }

  function handleProviderChange(value: string | null) {
    if (!value) return;
    setNewModel((prev) => ({
      ...prev,
      provider: value as ModelConfig["provider"],
      baseUrl: PROVIDER_URLS[value] ?? prev.baseUrl ?? "",
    }));
  }

  function handleAddModel() {
    if (!newModel.name || !newModel.baseUrl || !newModel.model) return;

    const config: ModelConfig = {
      id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newModel.name,
      provider: newModel.provider ?? "openai",
      baseUrl: newModel.baseUrl,
      apiKey: newModel.apiKey ?? "",
      model: newModel.model,
    };

    addSavedModel(config);
    setActiveModel(config);
    setOpen(false);

    // 重置表单
    setNewModel({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
    });
    setView("list");
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setView("list"); }}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            {activeModel ? activeModel.name : "选择模型"}
            <ChevronsUpDown className="size-3.5 opacity-50" />
          </Button>
        }
      />

      <PopoverContent className="w-72 border-border/60 p-0 shadow-md" align="end">
        {view === "list" ? (
          <div className="flex flex-col gap-0.5 p-1">
            {/* 已保存模型 */}
            {savedModels.length > 0 && (
              <>
                <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground/60">已保存</div>
                {savedModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectModel(model)}
                  >
                    <Check
                      className={cn(
                        "size-3.5",
                        activeModel?.id === model.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 truncate">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedModel(model.id);
                      }}
                    >
                      <Trash2 className="size-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <div className="my-1 h-px bg-border/60" />
              </>
            )}

            {/* 快速添加 */}
            <div
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
              onClick={() => setView("add")}
            >
              <Plus className="size-3.5" />
              快速添加模型
            </div>

            {/* 前往完整设置 */}
            <div
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
              onClick={() => { setOpen(false); setSettingsOpen(true); }}
            >
              <Bot className="size-3.5" />
              管理模型（设置页）
            </div>
          </div>
        ) : (
          /* 快速添加模型表单 */
          <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-xs" onClick={() => setView("list")}>
                <ArrowLeft className="size-3.5" />
              </Button>
              <span className="text-sm font-medium">添加模型</span>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">模型名称</label>
              <Input
                placeholder="例如: My GPT-4o"
                value={newModel.name ?? ""}
                onChange={(e) => setNewModel((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">提供者</label>
              <Select value={newModel.provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI 兼容</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">API 地址</label>
              <div className="flex items-center gap-1">
                <Globe className="size-3.5 text-muted-foreground" />
                <Input
                  placeholder="https://api.openai.com/v1"
                  value={newModel.baseUrl ?? ""}
                  onChange={(e) => setNewModel((prev) => ({ ...prev, baseUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">模型 ID</label>
              <div className="flex items-center gap-1">
                <Bot className="size-3.5 text-muted-foreground" />
                <Input
                  placeholder="gpt-4o"
                  value={newModel.model ?? ""}
                  onChange={(e) => setNewModel((prev) => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>

            {newModel.provider !== "ollama" && (
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">API Key</label>
                <div className="flex items-center gap-1">
                  <Key className="size-3.5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={newModel.apiKey ?? ""}
                    onChange={(e) => setNewModel((prev) => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleAddModel}
              disabled={!newModel.name || !newModel.model || !newModel.baseUrl}
            >
              <Plus className="size-3.5" />
              添加模型
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
