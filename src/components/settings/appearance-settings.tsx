"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppearanceStore } from "@/stores/appearance-store";

export function AppearanceSettings() {
  const borderRadius = useAppearanceStore((s) => s.borderRadius);
  const setBorderRadius = useAppearanceStore((s) => s.setBorderRadius);
  const resetBorderRadius = useAppearanceStore((s) => s.resetBorderRadius);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">圆角</h2>
        <p className="text-xs text-muted-foreground">
          调整全局界面元素的圆角大小。范围 0 ~ 1.5rem，当前 {borderRadius.toFixed(3)}rem。
        </p>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.125}
            value={borderRadius}
            onChange={(e) => setBorderRadius(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-primary
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-sm
                       [&::-webkit-slider-thumb]:transition-transform
                       [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <span className="text-sm font-medium tabular-nums w-16 text-right">
            {borderRadius.toFixed(3)}rem
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetBorderRadius}
          className="w-fit"
        >
          <RotateCcw className="size-3.5" />
          重置默认
        </Button>
      </section>
    </div>
  );
}