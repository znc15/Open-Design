/**
 * 初始化问题表单相关类型
 * 参考 nexu-io/open-design 的 discovery.ts
 */

/** 设计产出类型 */
export type DesignSurface = "web" | "mobile" | "deck" | "email" | "social" | "print";

/** 视觉调性 */
export type VisualTone = "editorial" | "modern-minimal" | "tech-utility" | "brutalist" | "soft-warm";

/** 目标受众 */
export type TargetAudience = "b2b" | "b2c" | "internal" | "developer" | "consumer" | "executive";

/** 项目规模 */
export type ProjectScale = "single-page" | "multi-page" | "dashboard" | "full-site" | "deck-10" | "deck-20";

/** 初始化问题表单数据 */
export interface DiscoveryFormData {
  /** 设计产出类型 */
  surface: DesignSurface;
  /** 目标受众 */
  audience: TargetAudience;
  /** 视觉调性 */
  tone: VisualTone;
  /** 品牌上下文（用户提供的品牌描述或 URL） */
  brandContext?: string;
  /** 项目规模 */
  scale: ProjectScale;
  /** 其他约束条件 */
  constraints?: string[];
  /** 是否有品牌资产 */
  hasBrandAssets: boolean;
}

/** 视觉方向定义 */
export interface VisualDirection {
  id: VisualTone;
  name: string;
  description: string;
  references: string[];
  /** OKLch 色板 */
  palette: {
    background: string;
    foreground: string;
    accent: string;
    muted: string;
    border: string;
  };
  /** 字体栈 */
  fonts: {
    display: string;
    body: string;
    mono?: string;
  };
  /** 版式姿态 */
  layoutStyle: string;
}

/** 五维评审维度 */
export type CritiqueDimension = "philosophy" | "hierarchy" | "detail" | "function" | "restraint";

/** 五维评审结果 */
export interface CritiqueResult {
  dimension: CritiqueDimension;
  score: number; // 1-5
  comment: string;
  passed: boolean; // score >= 3
}

/** Todo 任务状态 */
export type TodoStatus = "pending" | "in_progress" | "completed" | "blocked";

/** Todo 任务项 */
export interface TodoItem {
  id: string;
  content: string;
  status: TodoStatus;
  priority: "P0" | "P1" | "P2";
  createdAt: number;
  updatedAt: number;
}