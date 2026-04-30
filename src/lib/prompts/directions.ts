/**
 * 5 套精选视觉方向定义
 * 参考 nexu-io/open-design 的 directions.ts
 * 每套自带 OKLch 色板 + 字体栈
 */

import type { VisualDirection, VisualTone } from "@/types/discovery";

/** 5 套精选视觉方向 */
export const VISUAL_DIRECTIONS: VisualDirection[] = [
  {
    id: "editorial",
    name: "Editorial — Monocle / FT",
    description: "印刷杂志风格，墨水 + 米色纸 + 暖红强调，优雅克制",
    references: ["Monocle", "FT Weekend", "NYT Magazine", "The Economist"],
    palette: {
      background: "oklch(0.96 0.01 80)", // 米色纸
      foreground: "oklch(0.20 0.02 250)", // 墨水黑
      accent: "oklch(0.55 0.15 25)", // 暖红
      muted: "oklch(0.70 0.02 80)", // 浅灰米
      border: "oklch(0.85 0.02 80)", // 边框灰
    },
    fonts: {
      display: "'Playfair Display', 'Times New Roman', serif",
      body: "'Source Serif Pro', 'Georgia', serif",
      mono: "'IBM Plex Mono', monospace",
    },
    layoutStyle: "editorial-grid: 12-column, generous margins, pull-quotes, serif hierarchy",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal — Linear / Vercel",
    description: "冷调、结构化、克制强调，现代科技感",
    references: ["Linear", "Vercel", "Stripe", "Raycast"],
    palette: {
      background: "oklch(0.98 0.00 0)", // 纯白
      foreground: "oklch(0.15 0.02 250)", // 冷黑
      accent: "oklch(0.65 0.20 250)", // 冷蓝紫
      muted: "oklch(0.60 0.02 250)", // 灰
      border: "oklch(0.90 0.01 250)", // 浅边框
    },
    fonts: {
      display: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      body: "'Inter', 'SF Pro Text', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    layoutStyle: "minimal-grid: 8-column, tight spacing, geometric, flat cards",
  },
  {
    id: "tech-utility",
    name: "Tech Utility — Bloomberg / Terminal",
    description: "信息密度、等宽、终端感，数据驱动",
    references: ["Bloomberg Terminal", "Bauhaus tools", "TradingView", "GitHub"],
    palette: {
      background: "oklch(0.12 0.02 250)", // 深色背景
      foreground: "oklch(0.90 0.02 250)", // 亮文字
      accent: "oklch(0.70 0.25 140)", // 绿色强调
      muted: "oklch(0.50 0.02 250)", // 灰文字
      border: "oklch(0.25 0.02 250)", // 边框
    },
    fonts: {
      display: "'JetBrains Mono', 'IBM Plex Mono', monospace",
      body: "'IBM Plex Mono', monospace",
      mono: "'JetBrains Mono', monospace",
    },
    layoutStyle: "dense-grid: data-tables, compact rows, monospace labels, status indicators",
  },
  {
    id: "brutalist",
    name: "Brutalist — Bloomberg Businessweek / Achtung",
    description: "粗粝、巨字、无阴影、刺眼强调，反设计",
    references: ["Bloomberg Businessweek", "Achtung", "Art Papers", "Brutalist websites"],
    palette: {
      background: "oklch(0.95 0.00 0)", // 白
      foreground: "oklch(0.10 0.00 0)", // 纯黑
      accent: "oklch(0.60 0.30 25)", // 刺眼红/黄
      muted: "oklch(0.40 0.00 0)", // 中灰
      border: "oklch(0.10 0.00 0)", // 黑边框
    },
    fonts: {
      display: "'Helvetica Neue', 'Arial Black', sans-serif",
      body: "'Helvetica Neue', sans-serif",
    },
    layoutStyle: "brutalist: oversized type, no shadows, hard borders, raw html, grid-breaks",
  },
  {
    id: "soft-warm",
    name: "Soft Warm — Notion / Apple Health",
    description: "大方、低对比、桃色中性，亲和友好",
    references: ["Notion marketing", "Apple Health", "Calm", "Headspace"],
    palette: {
      background: "oklch(0.97 0.02 70)", // 温暖白
      foreground: "oklch(0.30 0.02 70)", // 温暖灰
      accent: "oklch(0.65 0.12 50)", // 桃色/珊瑚
      muted: "oklch(0.65 0.02 70)", // 浅灰
      border: "oklch(0.88 0.02 70)", // 边框
    },
    fonts: {
      display: "'Nunito', 'SF Pro Display', sans-serif",
      body: "'Nunito Sans', 'SF Pro Text', sans-serif",
    },
    layoutStyle: "soft-grid: rounded corners, subtle shadows, generous padding, friendly icons",
  },
];

/** 获取方向定义 */
export function getDirection(id: VisualTone): VisualDirection | undefined {
  return VISUAL_DIRECTIONS.find((d) => d.id === id);
}

/** 生成方向的 CSS 变量 */
export function generateDirectionCSS(direction: VisualDirection): string {
  const { palette, fonts } = direction;
  return `
:root {
  --color-background: ${palette.background};
  --color-foreground: ${palette.foreground};
  --color-accent: ${palette.accent};
  --color-muted: ${palette.muted};
  --color-border: ${palette.border};

  --font-display: ${fonts.display};
  --font-body: ${fonts.body};
  ${fonts.mono ? `--font-mono: ${fonts.mono};` : ""}
}
`;
}