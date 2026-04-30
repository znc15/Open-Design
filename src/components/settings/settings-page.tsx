"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Key, Globe, Bot, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { modelService } from "@/services";
import type { ModelConfig } from "@/types/chat";

type Provider = ModelConfig["provider"];

const PROVIDER_OPTIONS: Array<{ value: Provider; label: string; defaultUrl: string }> = [
  { value: "openai", label: "OpenAI 兼容", defaultUrl: "https://api.openai.com/v1" },
  { value: "ollama", label: "Ollama", defaultUrl: "http://localhost:11434" },
  { value: "anthropic", label: "Anthropic", defaultUrl: "https://api.anthropic.com" },
];

interface SettingsPageProps {
  /** 嵌入模式：去掉顶栏返回按钮，仅渲染内容 */
  embedded?: boolean;
}

export function SettingsPage({ embedded }: SettingsPageProps) {

  const activeModel = useChatStore((s) => s.activeModel);
  const savedModels = useChatStore((s) => s.savedModels);
  const setActiveModel = useChatStore((s) => s.setActiveModel);
  const addSavedModel = useChatStore((s) => s.addSavedModel);
  const removeSavedModel = useChatStore((s) => s.removeSavedModel);

  /* ---- 添加模型表单 ---- */
  const [form, setForm] = useState<Partial<ModelConfig>>({
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
  });

  /* ---- /models 拉取状态 ---- */
  const [remoteModels, setRemoteModels] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState("");

  /* ---- 编辑已保存模型的 API Key ---- */
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingApiKey, setEditingApiKey] = useState("");

  function handleProviderChange(value: string | null) {
    if (!value) return;
    const provider = value as Provider;
    const preset = PROVIDER_OPTIONS.find((p) => p.value === provider);
    setForm((prev) => ({
      ...prev,
      provider,
      baseUrl: preset?.defaultUrl ?? prev.baseUrl ?? "",
    }));
    // 切换 provider 时清空远程模型列表
    setRemoteModels([]);
    setFetchError("");
  }

  /** 从 /models 拉取可用模型 */
  const handleFetchModels = useCallback(async () => {
    const baseUrl = form.baseUrl?.trim();
    const provider = form.provider ?? "openai";
    if (!baseUrl) {
      setFetchError("请先填写 API 地址");
      return;
    }

    setFetchingModels(true);
    setFetchError("");

    const tempConfig: ModelConfig = {
      id: "__fetch__",
      name: "__fetch__",
      provider,
      baseUrl,
      apiKey: form.apiKey ?? "",
      model: "__fetch__",
    };

    try {
      const models = await modelService.listModels(tempConfig);
      if (models.length === 0) {
        setFetchError("未发现可用模型");
        setRemoteModels([]);
      } else {
        setRemoteModels(models);
        setFetchError("");
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "获取模型列表失败");
      setRemoteModels([]);
    } finally {
      setFetchingModels(false);
    }
  }, [form.baseUrl, form.apiKey, form.provider]);

  /** 选择远程模型后填入表单 */
  function handleSelectRemoteModel(modelId: string) {
    setForm((prev) => ({
      ...prev,
      model: modelId,
      name: prev.name || modelId,
    }));
  }

  /** 添加新模型 */
  function handleAddModel() {
    if (!form.name || !form.baseUrl || !form.model) return;

    const config: ModelConfig = {
      id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name,
      provider: form.provider ?? "openai",
      baseUrl: form.baseUrl,
      apiKey: form.apiKey ?? "",
      model: form.model,
    };

    addSavedModel(config);
    setActiveModel(config);

    // 重置表单
    setForm({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
    });
    setRemoteModels([]);
    setFetchError("");
  }

  /** 保存 API Key */
  function handleSaveApiKey(modelId: string) {
    const model = savedModels.find((m) => m.id === modelId);
    if (!model) return;

    addSavedModel({ ...model, apiKey: editingApiKey });
    if (activeModel?.id === modelId) {
      setActiveModel({ ...model, apiKey: editingApiKey });
    }
    setEditingModelId(null);
    setEditingApiKey("");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 顶栏 — 仅独立模式 */}
      {!embedded && (
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-3">
          <h1 className="text-lg font-semibold">设置</h1>
        </div>
      )}

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-2xl flex flex-col gap-6">

          {/* ====== 已配置的模型 ====== */}
          {savedModels.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">已配置的模型</h2>
              {savedModels.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-card to-card/80 p-3 transition-all hover:shadow-sm",
                    activeModel?.id === model.id && "border-primary/60 bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm ring-1 ring-primary/20"
                  )}
                >
                  <button
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() => setActiveModel(model)}
                  >
                    <Bot className="size-4 text-primary/70" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.provider} · {model.model}
                      </span>
                    </div>
                    {activeModel?.id === model.id && (
                      <Check className="ml-auto size-4 text-primary" />
                    )}
                  </button>

                  {editingModelId === model.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="password"
                        placeholder="API Key"
                        value={editingApiKey}
                        onChange={(e) => setEditingApiKey(e.target.value)}
                        className="h-7 w-40 text-xs"
                      />
                      <Button variant="ghost" size="icon-sm" onClick={() => handleSaveApiKey(model.id)}>
                        <Check className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditingModelId(null)}>
                        <span className="text-xs">✕</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingModelId(model.id);
                          setEditingApiKey(model.apiKey ?? "");
                        }}
                        title="编辑 API Key"
                      >
                        <Key className="size-3 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeSavedModel(model.id)}
                        title="删除模型"
                      >
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          <div className="border-t border-border/40 my-1" />

          {/* ====== 添加新模型 ====== */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-foreground">添加新模型</h2>

            {/* 模型名称 */}
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">模型名称</label>
              <Input
                placeholder="例如: My GPT-4o"
                value={form.name ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* 提供者 */}
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">提供者</label>
              <Select value={form.provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* API 地址 */}
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">API 地址</label>
              <div className="flex items-center gap-1">
                <Globe className="size-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="https://api.openai.com/v1"
                  value={form.baseUrl ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
                />
              </div>
            </div>

            {/* API Key */}
            {form.provider !== "ollama" && (
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">API Key</label>
                <div className="flex items-center gap-1">
                  <Key className="size-4 text-muted-foreground shrink-0" />
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={form.apiKey ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* 获取模型列表按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchModels}
                disabled={fetchingModels || !form.baseUrl}
              >
                {fetchingModels ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                获取模型列表
              </Button>
              {fetchError && <span className="text-xs text-destructive">{fetchError}</span>}
            </div>

            {/* 远程模型列表 — 可选择自动填入 */}
            {remoteModels.length > 0 && (
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  可用模型（点击选择）
                </label>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-xl border border-border/60 p-1.5">
                  {remoteModels.map((m) => (
                    <button
                      key={m.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors",
                        form.model === m.id && "bg-primary/10 text-primary"
                      )}
                      onClick={() => handleSelectRemoteModel(m.id)}
                    >
                      {form.model === m.id && <Check className="size-3" />}
                      <span className="flex-1 truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 模型 ID（手动输入或从远程选择后自动填入） */}
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">模型 ID</label>
              <div className="flex items-center gap-1">
                <Bot className="size-4 text-primary/70 shrink-0" />
                <Input
                  placeholder="gpt-4o"
                  value={form.model ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>

            <Button
              onClick={handleAddModel}
              disabled={!form.name || !form.model || !form.baseUrl}
              className="mt-2 w-fit shadow-sm"
            >
              <Plus className="size-4" />
              添加模型
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
