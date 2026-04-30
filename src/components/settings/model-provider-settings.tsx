"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, Trash2, Key, Globe, Bot, Check, RefreshCw, Loader2, Pencil, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

/** 模型编辑对话框 */
function ModelEditDialog({
  open,
  onOpenChange,
  model,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: ModelConfig;
  onSave: (model: ModelConfig) => void;
}) {
  const [form, setForm] = useState<ModelConfig>(model);

  const handleProviderChange = (value: string | null) => {
    if (!value) return;
    const provider = value as Provider;
    const preset = PROVIDER_OPTIONS.find((p) => p.value === provider);
    setForm((prev) => ({
      ...prev,
      provider,
      baseUrl: preset?.defaultUrl ?? prev.baseUrl,
    }));
  };

  const handleSave = () => {
    if (!form.name || !form.baseUrl || !form.model) return;
    onSave(form);
    onOpenChange(false);
  };

  // 当 model 变化时重置 form
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setForm(model);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑模型配置</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 模型名称 */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">模型名称</label>
            <Input
              placeholder="例如: My GPT-4o"
              value={form.name}
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
                value={form.baseUrl}
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

          {/* 模型 ID */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">模型 ID</label>
            <div className="flex items-center gap-1">
              <Bot className="size-4 text-primary/70 shrink-0" />
              <Input
                placeholder="gpt-4o"
                value={form.model}
                onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
              />
            </div>
          </div>

          {/* 高级参数 */}
          <div className="border-t border-border/40 pt-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">高级参数</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">最大输出 Token</label>
                <Input
                  type="number"
                  placeholder="4096"
                  value={form.maxTokens ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || undefined }))}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">温度 (0-2)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  placeholder="0.7"
                  value={form.temperature ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, temperature: parseFloat(e.target.value) || undefined }))}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">上下文大小</label>
                <Input
                  type="number"
                  placeholder="4096"
                  value={form.contextSize ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, contextSize: parseInt(e.target.value) || undefined }))}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">思考强度</label>
                <Select
                  value={form.thinkingIntensity ?? ""}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, thinkingIntensity: value as "low" | "medium" | "high" | undefined || undefined }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="默认" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="edit-enableCache"
                checked={form.enableCache ?? false}
                onChange={(e) => setForm((prev) => ({ ...prev, enableCache: e.target.checked }))}
                className="size-4 rounded border-border"
              />
              <label htmlFor="edit-enableCache" className="text-xs text-muted-foreground">
                启用 Prompt 缓存（减少重复请求成本）
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!form.name || !form.model || !form.baseUrl}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 添加模型对话框 */
function AddModelDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (model: ModelConfig) => void;
}) {
  const [form, setForm] = useState<Partial<ModelConfig>>({
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    maxTokens: 4096,
    temperature: 0.7,
  });
  const [remoteModels, setRemoteModels] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const handleProviderChange = (value: string | null) => {
    if (!value) return;
    const provider = value as Provider;
    const preset = PROVIDER_OPTIONS.find((p) => p.value === provider);
    setForm((prev) => ({
      ...prev,
      provider,
      baseUrl: preset?.defaultUrl ?? prev.baseUrl ?? "",
    }));
    setRemoteModels([]);
    setFetchError("");
  };

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

  const handleSelectRemoteModel = (modelId: string) => {
    setForm((prev) => ({
      ...prev,
      model: modelId,
      name: prev.name || modelId,
    }));
  };

  const handleAdd = () => {
    if (!form.name || !form.baseUrl || !form.model) return;

    const config: ModelConfig = {
      id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name,
      provider: form.provider ?? "openai",
      baseUrl: form.baseUrl,
      apiKey: form.apiKey ?? "",
      model: form.model,
      maxTokens: form.maxTokens ?? 4096,
      temperature: form.temperature ?? 0.7,
      contextSize: form.contextSize,
      enableCache: form.enableCache,
      thinkingIntensity: form.thinkingIntensity,
    };

    onAdd(config);
    onOpenChange(false);

    // 重置表单
    setForm({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      maxTokens: 4096,
      temperature: 0.7,
    });
    setRemoteModels([]);
    setFetchError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加新模型</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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

          {/* 远程模型列表 */}
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

          {/* 模型 ID */}
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

          {/* 高级参数 */}
          <div className="border-t border-border/40 pt-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">高级参数</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">最大输出 Token</label>
                <Input
                  type="number"
                  placeholder="4096"
                  value={form.maxTokens ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || undefined }))}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">温度 (0-2)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  placeholder="0.7"
                  value={form.temperature ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, temperature: parseFloat(e.target.value) || undefined }))}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">上下文大小</label>
                <Input
                  type="number"
                  placeholder="4096"
                  value={form.contextSize ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, contextSize: parseInt(e.target.value) || undefined }))}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">思考强度</label>
                <Select
                  value={form.thinkingIntensity ?? ""}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, thinkingIntensity: value as "low" | "medium" | "high" | undefined || undefined }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="默认" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="add-enableCache"
                checked={form.enableCache ?? false}
                onChange={(e) => setForm((prev) => ({ ...prev, enableCache: e.target.checked }))}
                className="size-4 rounded border-border"
              />
              <label htmlFor="add-enableCache" className="text-xs text-muted-foreground">
                启用 Prompt 缓存（减少重复请求成本）
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleAdd} disabled={!form.name || !form.model || !form.baseUrl}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModelProviderSettings() {
  const activeModel = useChatStore((s) => s.activeModel);
  const savedModels = useChatStore((s) => s.savedModels);
  const setActiveModel = useChatStore((s) => s.setActiveModel);
  const addSavedModel = useChatStore((s) => s.addSavedModel);
  const removeSavedModel = useChatStore((s) => s.removeSavedModel);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ modelId: string; success: boolean; message: string } | null>(null);

  /** 测试模型连接 */
  const handleTestModel = useCallback(async (model: ModelConfig) => {
    setTestingModelId(model.id);
    setTestResult(null);

    try {
      // 发送一个简单的测试请求
      const testMessage = [{ role: "user", content: "Hi" }];
      let hasResponse = false;

      for await (const chunk of modelService.sendMessage(model, testMessage)) {
        if (chunk.type === "text" && chunk.text) {
          hasResponse = true;
          break; // 收到响应即可停止
        }
      }

      if (hasResponse) {
        setTestResult({ modelId: model.id, success: true, message: "连接成功" });
      } else {
        setTestResult({ modelId: model.id, success: false, message: "未收到响应" });
      }
    } catch (err) {
      setTestResult({
        modelId: model.id,
        success: false,
        message: err instanceof Error ? err.message : "连接失败",
      });
    } finally {
      setTestingModelId(null);
    }
  }, []);

  /** 保存编辑后的模型 */
  const handleSaveEdit = (model: ModelConfig) => {
    addSavedModel(model);
    if (activeModel?.id === model.id) {
      setActiveModel(model);
    }
    setEditingModel(null);
  };

  return (
    <div className="flex flex-col gap-6">
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

              <div className="flex items-center gap-1">
                {/* 测试连接按钮 */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleTestModel(model)}
                  disabled={testingModelId === model.id}
                  title="测试连接"
                >
                  {testingModelId === model.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : testResult?.modelId === model.id ? (
                    testResult.success ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <X className="size-3 text-destructive" />
                    )
                  ) : (
                    <Zap className="size-3 text-muted-foreground" />
                  )}
                </Button>
                {/* 编辑按钮 */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingModel(model)}
                  title="编辑配置"
                >
                  <Pencil className="size-3 text-muted-foreground" />
                </Button>
                {/* 删除按钮 */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSavedModel(model.id)}
                  title="删除模型"
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 测试结果提示 */}
      {testResult && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
            testResult.success
              ? "bg-green-500/10 text-green-600 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}
        >
          {testResult.success ? (
            <Check className="size-3.5" />
          ) : (
            <X className="size-3.5" />
          )}
          {testResult.message}
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={() => setTestResult(null)}
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      <div className="border-t border-border/40 my-1" />

      {/* ====== 添加模型按钮 ====== */}
      <section className="flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={() => setShowAddDialog(true)}
          className="w-fit"
        >
          <Plus className="size-4" />
          添加模型
        </Button>
      </section>

      {/* 添加模型对话框 */}
      <AddModelDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(model) => {
          addSavedModel(model);
          setActiveModel(model);
        }}
      />

      {/* 编辑模型对话框 */}
      {editingModel && (
        <ModelEditDialog
          open={!!editingModel}
          onOpenChange={(open) => !open && setEditingModel(null)}
          model={editingModel}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
