"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasStore, DEVICE_SIZES, type PreviewDevice, type SelectedElementInfo } from "@/stores/canvas-store";

/** 预览设备切换按钮配置 */
const DEVICE_BUTTONS: Array<{
  device: PreviewDevice;
  icon: typeof Monitor;
  label: string;
}> = [
  { device: "desktop", icon: Monitor, label: "桌面" },
  { device: "tablet", icon: Tablet, label: "平板" },
  { device: "mobile", icon: Smartphone, label: "手机" },
];

export function DesignCanvas() {
  const previewDevice = useCanvasStore((s) => s.previewDevice);
  const zoom = useCanvasStore((s) => s.zoom);
  const setPreviewDevice = useCanvasStore((s) => s.setPreviewDevice);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const editorCode = useCanvasStore((s) => s.editorCode);
  const selectedId = useCanvasStore((s) => s.selectedId);
  const setSelectedId = useCanvasStore((s) => s.setSelectedId);
  const selectedElementInfo = useCanvasStore((s) => s.selectedElementInfo);
  const setSelectedElementInfo = useCanvasStore((s) => s.setSelectedElementInfo);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const deviceSize = DEVICE_SIZES[previewDevice];

  /** 构建 iframe 内容，包含点击事件监听脚本 */
  const buildIframeContent = useCallback(() => {
    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, sans-serif; }
      /* 选中元素高亮样式 */
      .__opendesign_selected__ {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
    `;

    // 注入点击事件监听脚本
    const script = `
      <script>
        (function() {
          let selectedElement = null;

          function getElementPath(el) {
            const path = [];
            let current = el;
            while (current && current !== document.body) {
              let selector = current.tagName.toLowerCase();
              if (current.id) {
                selector += '#' + current.id;
              } else if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\\s+/).filter(c => c && !c.startsWith('__opendesign'));
                if (classes.length > 0) {
                  selector += '.' + classes.slice(0, 2).join('.');
                }
              }
              path.unshift(selector);
              current = current.parentElement;
            }
            return path.join(' > ');
          }

          function handleClick(e) {
            e.preventDefault();
            e.stopPropagation();

            // 移除之前的选中样式
            if (selectedElement) {
              selectedElement.classList.remove('__opendesign_selected__');
            }

            const el = e.target;
            selectedElement = el;
            el.classList.add('__opendesign_selected__');

            // 收集元素信息
            const info = {
              tagName: el.tagName.toLowerCase(),
              id: el.id || null,
              className: (el.className || '').replace(/__opendesign_selected__/g, '').trim(),
              textContent: (el.textContent || '').trim().slice(0, 100),
              path: getElementPath(el),
              style: el.getAttribute('style') || ''
            };

            // 通过 postMessage 发送到父窗口
            window.parent.postMessage({
              type: 'OPENDESIGN_ELEMENT_SELECTED',
              payload: info
            }, '*');
          }

          document.addEventListener('click', handleClick, true);
        })();
      </script>
    `;

    return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${editorCode}${script}</body></html>`;
  }, [editorCode]);

  // 监听来自 iframe 的消息
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'OPENDESIGN_ELEMENT_SELECTED') {
        setSelectedElementInfo(e.data.payload as SelectedElementInfo);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSelectedElementInfo]);

  const handleZoomIn = () => setZoom(zoom + 0.1);
  const handleZoomOut = () => setZoom(zoom - 0.1);
  const handleResetZoom = () => setZoom(1);

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="flex h-full flex-col bg-muted/20">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-card to-card/95 px-3 py-1 backdrop-blur-sm">
        {/* 设备切换 */}
        <div className="flex items-center gap-0.5">
          {DEVICE_BUTTONS.map(({ device, icon: Icon, label }) => (
            <Button
              key={device}
              variant={previewDevice === device ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setPreviewDevice(device)}
              aria-label={label}
              title={label}
            >
              <Icon className="size-3.5" />
            </Button>
          ))}
        </div>

        {/* 画布信息 */}
        <div className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
          {deviceSize.width} × {deviceSize.height}
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={handleZoomOut} aria-label="缩小">
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="min-w-[2.5rem] text-center text-[11px] text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon-sm" onClick={handleZoomIn} aria-label="放大">
            <ZoomIn className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleResetZoom} aria-label="重置缩放">
            <span className="text-[11px]">重置</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleFullscreen} aria-label="全屏">
            <Maximize className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 选中元素信息提示 */}
      {selectedElementInfo && (
        <div className="flex items-center gap-2 border-b border-border/40 bg-primary/5 px-3 py-1.5 text-xs">
          <span className="font-mono text-primary">{selectedElementInfo.tagName}</span>
          {selectedElementInfo.id && (
            <span className="text-muted-foreground">#{selectedElementInfo.id}</span>
          )}
          {selectedElementInfo.className && (
            <span className="text-muted-foreground truncate max-w-[200px]">.{selectedElementInfo.className.split(/\s+/)[0]}</span>
          )}
          <span className="text-muted-foreground/60 truncate flex-1">{selectedElementInfo.path}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedElementInfo(null)}
            title="取消选中"
          >
            <span className="text-[10px]">✕</span>
          </Button>
        </div>
      )}

      {/* 画布区域 */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        <div
          className={cn(
            "relative rounded-lg border border-border/60 bg-white shadow-sm transition-all duration-200",
            isFullscreen && "border-0 shadow-none"
          )}
          style={{
            width: deviceSize.width,
            height: deviceSize.height,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={buildIframeContent()}
            className="h-full w-full border-0"
            title="设计预览"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
