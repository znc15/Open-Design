"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, X, Sparkles, ExternalLink } from "lucide-react";
import { useTodoStore } from "@/stores/todo-store";
import { SURFACE_OPTIONS, AUDIENCE_OPTIONS, SCALE_OPTIONS } from "@/lib/prompts/discovery";
import { VISUAL_DIRECTIONS } from "@/lib/prompts/directions";
import type { DiscoveryFormData, DesignSurface, TargetAudience, VisualTone, ProjectScale } from "@/types/discovery";

/** 单选按钮组 */
function RadioGroup({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: Array<{ value: string; label: string; description: string }>;
  value: string | null;
  onChange: (value: string) => void;
  columns?: number;
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-1")}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-all",
            value === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
          )}
        >
          <span className="text-sm font-medium">{option.label}</span>
          <span className="text-xs text-muted-foreground truncate">{option.description}</span>
        </button>
      ))}
    </div>
  );
}

/** 方向选择器（带预览） */
function DirectionSelector({
  value,
  onChange,
}: {
  value: VisualTone | null;
  onChange: (value: VisualTone) => void;
}) {
  return (
    <div className="space-y-2">
      {VISUAL_DIRECTIONS.map((direction) => (
        <button
          key={direction.id}
          onClick={() => onChange(direction.id)}
          className={cn(
            "w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
            value === direction.id
              ? "border-primary bg-primary/10"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
          )}
        >
          {/* 色板预览 */}
          <div className="flex shrink-0 gap-0.5">
            {Object.entries(direction.palette).slice(0, 4).map(([key, color]) => (
              <div
                key={key}
                className="size-4 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", value === direction.id && "text-primary")}>
                {direction.name}
              </span>
              {value === direction.id && <Check className="size-3 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">{direction.description}</p>
            <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
              参考: {direction.references.join(", ")}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DiscoveryFormData) => void;
  initialData?: Partial<DiscoveryFormData>;
}) {
  const [step, setStep] = useState<"form" | "direction">(initialData?.tone ? "form" : "form");
  const [surface, setSurface] = useState<DesignSurface | null>(initialData?.surface || null);
  const [audience, setAudience] = useState<TargetAudience | null>(initialData?.audience || null);
  const [tone, setTone] = useState<VisualTone | null>(initialData?.tone || null);
  const [scale, setScale] = useState<ProjectScale | null>(initialData?.scale || null);
  const [brandContext, setBrandContext] = useState(initialData?.brandContext || "");
  const [constraints, setConstraints] = useState(initialData?.constraints?.join(", ") || "");
  const [hasBrandAssets, setHasBrandAssets] = useState(initialData?.hasBrandAssets || false);

  const handleSubmit = useCallback(() => {
    if (!surface || !audience || !tone || !scale) return;

    const data: DiscoveryFormData = {
      surface,
      audience,
      tone,
      scale,
      brandContext: brandContext.trim() || undefined,
      constraints: constraints.trim() ? constraints.split(",").map((c) => c.trim()) : undefined,
      hasBrandAssets,
    };

    onSubmit(data);
    onOpenChange(false);
  }, [surface, audience, tone, scale, brandContext, constraints, hasBrandAssets, onSubmit, onOpenChange]);

  const canSubmit = surface && audience && tone && scale;

  // 如果没有品牌上下文且没有选择方向，需要先选择方向
  const needsDirection = !brandContext.trim() && !tone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {step === "form" ? "初始化设计任务" : "选择视觉方向"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {step === "form" ? (
            <div className="space-y-4 py-4">
              {/* 设计产出类型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">设计产出类型</label>
                <RadioGroup
                  options={SURFACE_OPTIONS}
                  value={surface}
                  onChange={(v) => setSurface(v as DesignSurface)}
                  columns={3}
                />
              </div>

              {/* 目标受众 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">目标受众</label>
                <RadioGroup
                  options={AUDIENCE_OPTIONS}
                  value={audience}
                  onChange={(v) => setAudience(v as TargetAudience)}
                  columns={3}
                />
              </div>

              {/* 项目规模 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">项目规模</label>
                <RadioGroup
                  options={SCALE_OPTIONS}
                  value={scale}
                  onChange={(v) => setScale(v as ProjectScale)}
                  columns={3}
                />
              </div>

              {/* 品牌上下文 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">品牌上下文（可选）</label>
                <Textarea
                  value={brandContext}
                  onChange={(e) => setBrandContext(e.target.value)}
                  placeholder="描述你的品牌风格，或粘贴品牌网站 URL..."
                  className="h-20"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasBrandAssets}
                    onChange={(e) => setHasBrandAssets(e.target.checked)}
                    className="size-4"
                  />
                  <span className="text-xs text-muted-foreground">我有品牌资产（Logo、色板等）</span>
                </div>
              </div>

              {/* 约束条件 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">约束条件（可选）</label>
                <Input
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="例如: 必须使用深色模式, 禁用动画"
                />
              </div>

              {/* 如果没有品牌上下文，显示方向选择 */}
              {!brandContext.trim() && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <label className="text-sm font-medium">视觉方向</label>
                  <p className="text-xs text-muted-foreground">
                    没有品牌上下文时，请选择一个视觉方向来锁定色板和字体
                  </p>
                  <DirectionSelector value={tone} onChange={setTone} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 py-4">
              <p className="text-sm text-muted-foreground">
                请选择一个视觉方向，系统将自动锁定色板和字体栈
              </p>
              <DirectionSelector value={tone} onChange={setTone} />
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t border-border/60 pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            开始设计
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}