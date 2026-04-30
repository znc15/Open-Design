"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Sparkles, Info, Globe, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelProviderSettings } from "./model-provider-settings";
import { SkillManagement } from "./skill-management";
import { AboutPage } from "./about-page";
import { SearchSettings } from "./search-settings";
import { ElementSelectionSettings } from "./element-selection-settings";

type SettingsTab = "models" | "search" | "skills" | "element" | "about";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  { id: "models", label: "模型提供商", icon: <Bot className="size-4" /> },
  { id: "search", label: "联网搜索", icon: <Globe className="size-4" /> },
  { id: "skills", label: "Skill 管理", icon: <Sparkles className="size-4" /> },
  { id: "element", label: "元素选中", icon: <MousePointer2 className="size-4" /> },
  { id: "about", label: "关于", icon: <Info className="size-4" /> },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("models");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[75vh] max-w-3xl flex-col p-0 sm:max-w-3xl gap-0 rounded-xl">
        <DialogHeader className="border-b border-border/60 bg-gradient-to-r from-card to-card/95 px-5 py-3 backdrop-blur-sm">
          <DialogTitle className="text-sm">设置</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧导航 */}
          <nav className="w-44 shrink-0 border-r border-border/60 bg-muted/30 p-2">
            <div className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* 右侧内容区 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 transition-opacity duration-200">
            {activeTab === "models" && <ModelProviderSettings />}
            {activeTab === "search" && <SearchSettings />}
            {activeTab === "skills" && <SkillManagement />}
            {activeTab === "element" && <ElementSelectionSettings />}
            {activeTab === "about" && <AboutPage />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
