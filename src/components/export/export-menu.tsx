"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Download,
  FileCode,
  FileText,
  Archive,
  Presentation,
  FileJson,
} from "lucide-react";

/** 导出格式 */
export type ExportFormat = "html" | "pdf" | "pptx" | "zip" | "markdown";

const EXPORT_OPTIONS: Array<{
  format: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileCode;
}> = [
  { format: "html", label: "HTML", description: "内联资源的单文件 HTML", icon: FileCode },
  { format: "pdf", label: "PDF", description: "浏览器打印，适配 Deck", icon: FileText },
  { format: "pptx", label: "PPTX", description: "Agent 驱动经由 Skill", icon: Presentation },
  { format: "zip", label: "ZIP", description: "完整项目打包", icon: Archive },
  { format: "markdown", label: "Markdown", description: "纯文本描述", icon: FileJson },
];

export function ExportMenu({
  onExport,
  disabled,
}: {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 h-7 rounded-md border border-input bg-background px-2.5 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
      >
        <Download className="size-3.5" />
        <span>导出</span>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-1" align="end">
        <div className="space-y-0.5">
          {EXPORT_OPTIONS.map(({ format, label, description, icon: Icon }) => (
            <button
              key={format}
              onClick={() => {
                onExport(format);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/50 transition-colors"
            >
              <Icon className="size-4 text-muted-foreground" />
              <div>
                <span className="text-sm">{label}</span>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** 执行导出 */
export function performExport(format: ExportFormat, content: string, projectName?: string): void {
  const name = projectName || "open-design-export";
  const timestamp = new Date().toISOString().slice(0, 10);

  switch (format) {
    case "html": {
      const blob = new Blob([content], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, `${name}-${timestamp}.html`);
      break;
    }
    case "pdf": {
      // 使用浏览器打印功能
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
      }
      break;
    }
    case "markdown": {
      // 简单的 HTML → Markdown 转换
      const markdown = htmlToMarkdown(content);
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      downloadBlob(blob, `${name}-${timestamp}.md`);
      break;
    }
    case "zip":
    case "pptx": {
      // ZIP 和 PPTX 需要后端支持，暂时降级为 HTML 导出
      const blob = new Blob([content], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, `${name}-${timestamp}.html`);
      break;
    }
  }
}

/** 下载 Blob */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** 简单的 HTML → Markdown 转换 */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}