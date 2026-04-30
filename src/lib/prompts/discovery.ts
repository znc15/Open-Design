/**
 * 初始化问题表单提示词
 * 参考 nexu-io/open-design 和 huashu-design 的 Junior-Designer 模式
 */

import type { DiscoveryFormData } from "@/types/discovery";

/** 设计产出类型选项 */
export const SURFACE_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: "web", label: "网页", description: "单页 Landing、营销页、Hero" },
  { value: "mobile", label: "移动端", description: "App 界面、移动原型" },
  { value: "deck", label: "演示 Deck", description: "PPT、Pitch Deck、周报" },
  { value: "email", label: "邮件", description: "营销邮件、通知邮件" },
  { value: "social", label: "社媒", description: "轮播图、海报、封面" },
  { value: "print", label: "印刷", description: "杂志、海报、名片" },
];

/** 目标受众选项 */
export const AUDIENCE_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: "b2b", label: "B2B 企业", description: "企业客户、决策者" },
  { value: "b2c", label: "B2C 消费者", description: "大众消费者" },
  { value: "developer", label: "开发者", description: "技术用户、工程师" },
  { value: "internal", label: "内部用户", description: "员工、团队内部" },
  { value: "executive", label: "高管", description: "C-level、投资人" },
  { value: "consumer", label: "消费级", description: "生活方式、娱乐" },
];

/** 项目规模选项 */
export const SCALE_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: "single-page", label: "单页", description: "一个页面" },
  { value: "multi-page", label: "多页", description: "2-5 个页面" },
  { value: "dashboard", label: "仪表盘", description: "数据密集型后台" },
  { value: "full-site", label: "完整站点", description: "全站设计" },
  { value: "deck-10", label: "10 页 Deck", description: "标准演示" },
  { value: "deck-20", label: "20 页 Deck", description: "详细演示" },
];

/** Anti-AI-Slop 黑名单 */
export const AI_SLOP_BLACKLIST = [
  "暴力紫渐变 (purple-gradient)",
  "通用 emoji 图标 (generic-emoji-icons)",
  "左 border 圆角卡片 (left-border-rounded-cards)",
  "手绘 SVG 真人脸 (hand-drawn-svg-faces)",
  "Inter 作为 display 字体 (inter-as-display)",
  "自编指标/虚假数据 (fake-metrics)",
  "「快 10 倍」等夸大文案 (exaggerated-copy)",
  "无意义的装饰元素 (meaningless-decorations)",
];

/** 生成初始化表单的 system prompt */
export function generateDiscoveryPrompt(formData: DiscoveryFormData): string {
  const surfaceDesc = SURFACE_OPTIONS.find((o) => o.value === formData.surface)?.description || "";
  const audienceDesc = AUDIENCE_OPTIONS.find((o) => o.value === formData.audience)?.description || "";
  const scaleDesc = SCALE_OPTIONS.find((o) => o.value === formData.scale)?.description || "";

  const lines: string[] = [
    "## 设计任务约束",
    "",
    `**产出类型**: ${formData.surface} - ${surfaceDesc}`,
    `**目标受众**: ${formData.audience} - ${audienceDesc}`,
    `**视觉调性**: ${formData.tone}`,
    `**项目规模**: ${formData.scale} - ${scaleDesc}`,
    `**品牌上下文**: ${formData.brandContext || "无（使用方向选择器的色板）"}`,
    `**约束条件**: ${formData.constraints?.join(", ") || "无特殊约束"}`,
    "",
    "## Anti-AI-Slop 规则",
    "",
    "**禁止使用以下 AI slop 元素**:",
    ...AI_SLOP_BLACKLIST.map((item) => `- ${item}`),
    "",
    "**诚实占位原则**:",
    "- 没有真实数据时使用 `--` 或标注的灰色占位块",
    "- 禁止虚构「快 10 倍」「提升 300%」等夸大文案",
    "- 禁止使用假图表、假数据",
    "",
    "## 输出要求",
    "",
    "1. 先输出 HTML 代码，使用 `<artifact>` 标签包裹",
    "2. 代码必须符合上述设计约束",
    "3. 使用选定的视觉调性色板和字体",
    "4. 禁止使用任何 AI slop 元素",
  ];

  return lines.join("\n");
}

/** 五维评审提示词 */
export const CRITIQUE_PROMPT = [
  "## 五维自评审",
  "",
  "在输出 `<artifact>` 之前，对自己 1-5 分打分：",
  "",
  "| 维度 | 评分标准 |",
  "|------|---------|",
  "| Philosophy | 设计哲学是否一致？调性是否匹配选定方向？ |",
  "| Hierarchy | 信息层级是否清晰？视觉优先级是否正确？ |",
  "| Detail | 细节执行是否到位？间距、字体、颜色是否协调？ |",
  "| Function | 功能是否完整？交互是否合理？ |",
  "| Restraint | 是否克制？是否有过度设计或 AI slop？ |",
  "",
  "**规则**: 任一维度 < 3/5 视为退步，必须修改后重新评审。",
].join("\n");
