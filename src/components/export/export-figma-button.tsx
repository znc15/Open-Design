"use client";

import { useState, useCallback } from "react";
import { FileOutput, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/stores/canvas-store";

/** 将 HTML 转为 Figma 剪贴板数据并复制到剪贴板 */
export function ExportFigmaButton() {
  const [exporting, setExporting] = useState(false);
  const editorCode = useCanvasStore((s) => s.editorCode);

  const handleExport = useCallback(async () => {
    if (!editorCode.trim()) return;
    setExporting(true);

    try {
      // 构建完整的 HTML 文档用于导出
      const fullHtml = wrapHtml(editorCode);

      const response = await fetch("/api/export-figma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: fullHtml }),
      });

      const isFigmaClipboard =
        response.headers.get("X-Clipboard-Mode") === "figma";

      if (isFigmaClipboard && response.ok) {
        // code.to.design 返回了 Figma 剪贴板数据
        const clipboardHtml = await response.text();
        await copyFigmaClipboard(clipboardHtml);
      } else {
        // 降级：复制原始 HTML
        await copyHtmlFallback(fullHtml);
      }
    } catch {
      // 网络或其他异常，走降级
      await copyHtmlFallback(wrapHtml(editorCode));
    } finally {
      setExporting(false);
    }
  }, [editorCode]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={exporting || !editorCode.trim()}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      title="导出到 Figma"
    >
      {exporting ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <FileOutput className="size-3.5" />
      )}
      {exporting ? "导出中…" : "导出 Figma"}
    </Button>
  );
}

/** 通过 copy 事件注入 Figma 剪贴板数据 */
async function copyFigmaClipboard(clipboardHtml: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const handler = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Figma 通过 text/html 格式识别剪贴板中的节点结构
      e.clipboardData?.setData("text/html", clipboardHtml);
      document.removeEventListener("copy", handler);
      resolve();
    };

    document.addEventListener("copy", handler);

    try {
      // execCommand('copy') 必须在用户交互的微任务链中触发
      const ok = document.execCommand("copy");
      if (!ok) {
        document.removeEventListener("copy", handler);
        reject(new Error("execCommand copy 失败"));
      }
    } catch (err) {
      document.removeEventListener("copy", handler);
      reject(err);
    }
  });
}

/** 降级方案：直接复制 HTML 源码到剪贴板 */
async function copyHtmlFallback(html: string): Promise<void> {
  await navigator.clipboard.writeText(html);
}

/** 将编辑器代码包装为完整 HTML 文档 */
function wrapHtml(code: string): string {
  // 如果已经是完整 HTML 文档，直接返回
  if (/<html[\s>]/i.test(code)) return code;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  </style>
</head>
<body>
${code}
</body>
</html>`;
}
