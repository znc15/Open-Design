"use client";

import { useCallback, useRef, useEffect } from "react";
import { Columns2, Rows2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesignCanvas } from "./design-canvas";
import { CodeEditor } from "@/components/editor/code-editor";
import { useCanvasStore } from "@/stores/canvas-store";
import { cn } from "@/lib/utils";

/** 画布 + 编辑器分屏视图 */
export function CanvasEditorView() {
  const splitDirection = useCanvasStore((s) => s.splitDirection);
  const splitRatio = useCanvasStore((s) => s.splitRatio);
  const setSplitRatio = useCanvasStore((s) => s.setSplitRatio);
  const setSplitDirection = useCanvasStore((s) => s.setSplitDirection);
  const isDraggingSplit = useCanvasStore((s) => s.isDraggingSplit);
  const setIsDraggingSplit = useCanvasStore((s) => s.setIsDraggingSplit);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingSplit(true);
    },
    [setIsDraggingSplit]
  );

  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let ratio: number;
      if (splitDirection === "horizontal") {
        ratio = (e.clientX - rect.left) / rect.width;
      } else {
        ratio = (e.clientY - rect.top) / rect.height;
      }
      setSplitRatio(ratio);
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplit, splitDirection, setSplitRatio, setIsDraggingSplit]);

  const toggleDirection = () => {
    setSplitDirection(splitDirection === "horizontal" ? "vertical" : "horizontal");
  };

  const isHorizontal = splitDirection === "horizontal";

  return (
    <div className="flex h-full flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleDirection}
            aria-label={isHorizontal ? "切换为垂直分屏" : "切换为水平分屏"}
            title={isHorizontal ? "垂直分屏" : "水平分屏"}
          >
            {isHorizontal ? <Rows2 className="size-4" /> : <Columns2 className="size-4" />}
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">设计画布 + 代码编辑器</span>
      </div>

      {/* 分屏容器 */}
      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden"
        style={{ flexDirection: isHorizontal ? "row" : "column" }}
      >
        {/* 画布面板 */}
        <div
          className="overflow-hidden"
          style={{
            [isHorizontal ? "width" : "height"]: `${splitRatio * 100}%`,
          }}
        >
          <DesignCanvas />
        </div>

        {/* 分隔线 */}
        <div
          className={cn(
            "flex-shrink-0 bg-border transition-colors hover:bg-primary/30",
            isHorizontal
              ? "w-1 cursor-col-resize"
              : "h-1 cursor-row-resize"
          )}
          onMouseDown={handleMouseDown}
        />

        {/* 编辑器面板 */}
        <div
          className="overflow-hidden"
          style={{
            [isHorizontal ? "width" : "height"]: `${(1 - splitRatio) * 100}%`,
          }}
        >
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}
