"use client";

import { MousePointer2, MessageSquare, Eye } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function ElementSelectionSettings() {
  const autoSendElement = useAppStore((s) => s.autoSendElement);
  const setAutoSendElement = useAppStore((s) => s.setAutoSendElement);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground">
        配置预览画布中点击元素选中后的行为。
      </div>

      {/* 自动发送元素开关 */}
      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-card to-card/80 p-4">
        <div className="shrink-0 mt-0.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="size-4 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">发送选中元素到对话</h3>
              <p className="text-xs text-muted-foreground mt-1">
                开启后，发送消息时自动附加选中的元素信息（标签名、ID、class 等），
                AI 可以根据元素上下文更精准地修改代码。
              </p>
            </div>
            <button
              onClick={() => setAutoSendElement(!autoSendElement)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                autoSendElement ? "bg-primary" : "bg-muted"
              }`}
              role="switch"
              aria-checked={autoSendElement}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoSendElement ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 状态说明 */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
            {autoSendElement ? (
              <>
                <Eye className="size-3.5 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  已开启 — 选中元素后发送消息会自动附加元素信息
                </span>
              </>
            ) : (
              <>
                <MousePointer2 className="size-3.5 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60">
                  已关闭 — 选中元素仅高亮显示，不会附加到对话
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
