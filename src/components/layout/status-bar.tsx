"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";

export function StatusBar() {
  const activeModel = useChatStore((state) => state.activeModel);
  const isStreaming = useChatStore((state) => state.isStreaming);

  return (
    <footer className="flex h-6 items-center justify-between border-t border-border/60 bg-gradient-to-r from-card to-card/95 px-4 text-[11px] text-muted-foreground backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {activeModel ? (
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full ring-2 ring-primary/20",
                isStreaming ? "animate-pulse bg-primary" : "bg-muted-foreground"
              )}
            />
            {activeModel.name}
          </span>
        ) : (
          <span>未选择模型</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span>OpenDesign v0.1.0</span>
      </div>
    </footer>
  );
}
