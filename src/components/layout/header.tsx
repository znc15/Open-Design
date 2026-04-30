"use client";

import { Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { ModelSelector } from "@/components/chat/model-selector";

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const chatPanelOpen = useAppStore((state) => state.chatPanelOpen);

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-border/60 bg-gradient-to-r from-card to-card/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight">OpenDesign</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ModelSelector />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenSettings}
          aria-label="设置"
        >
          <Settings className="size-4" />
        </Button>
      </div>
    </header>
  );
}
