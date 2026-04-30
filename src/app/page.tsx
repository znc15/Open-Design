"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { Header, StatusBar, AppSidebar } from "@/components/layout";
import { MessageList, ChatInput, TodoPanel } from "@/components/chat";
import { DesignCanvas } from "@/components/canvas/design-canvas";
import { MonacoCodeEditor } from "@/components/editor/monaco-editor";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { ExportMenu, performExport } from "@/components/export/export-menu";
import { useAppStore } from "@/stores/app-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { cn } from "@/lib/utils";
import { Code2, Eye, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 左侧最小/最大宽度占比 */
const MIN_CHAT_RATIO = 0.2;
const MAX_CHAT_RATIO = 0.6;

export default function Home() {
  const chatPanelOpen = useAppStore((s) => s.chatPanelOpen);
  const toggleChatPanel = useAppStore((s) => s.toggleChatPanel);
  const isDraggingMainSplit = useAppStore((s) => s.isDraggingMainSplit);
  const setDraggingMainSplit = useAppStore((s) => s.setDraggingMainSplit);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const [chatRatio, setChatRatio] = useState(0.35);
  const [rightTab, setRightTab] = useState<"preview" | "code">("preview");
  const containerRef = useRef<HTMLDivElement>(null);

  // 拖拽分隔条逻辑
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setDraggingMainSplit(true);
    },
    [setDraggingMainSplit]
  );

  useEffect(() => {
    if (!isDraggingMainSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setChatRatio(Math.max(MIN_CHAT_RATIO, Math.min(MAX_CHAT_RATIO, ratio)));
    };

    const handleMouseUp = () => {
      setDraggingMainSplit(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingMainSplit, setDraggingMainSplit]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* 侧边栏：对话历史 + 项目列表 */}
        <AppSidebar />

        {/* 中间对话面板 */}
        {chatPanelOpen && (
          <>
            <div className="flex flex-col overflow-hidden border-r border-border/60 bg-gradient-to-b from-card to-card/95"
              style={{ width: `${chatRatio * 100}%` }}
            >
              {/* Todo 进度面板 */}
              <TodoPanel />
              <MessageList />
              <ChatInput />
            </div>

            {/* 可拖拽分隔条 */}
            <div
              className={cn(
                "w-1 shrink-0 cursor-col-resize transition-colors",
                isDraggingMainSplit
                  ? "bg-primary/50"
                  : "bg-border/60 hover:bg-primary/30"
              )}
              onMouseDown={handleMouseDown}
            />
          </>
        )}

        {/* 右侧预览/代码面板 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 右侧工具栏 */}
          <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-card to-card/95 px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleChatPanel}
                aria-label={chatPanelOpen ? "收起对话面板" : "展开对话面板"}
                title={chatPanelOpen ? "收起对话面板" : "展开对话面板"}
              >
                {chatPanelOpen ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={rightTab === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setRightTab("preview")}
                className="gap-1.5"
              >
                <Eye className="size-3.5" />
                预览
              </Button>
              <Button
                variant={rightTab === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setRightTab("code")}
                className="gap-1.5"
              >
                <Code2 className="size-3.5" />
                代码
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <ExportMenu
                onExport={(format) => {
                  const editorCode = useCanvasStore.getState().editorCode;
                  performExport(format, editorCode);
                }}
              />
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 overflow-hidden">
            {rightTab === "preview" ? <DesignCanvas /> : <MonacoCodeEditor />}
          </div>
        </div>
      </div>

      <StatusBar />

      {/* 设置弹窗 */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
