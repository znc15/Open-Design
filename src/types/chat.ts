/** 聊天消息角色 */
export type MessageRole = "user" | "assistant" | "system";

/** 内容块类型 */
export type ContentBlockType =
  | "text"
  | "image"
  | "tool_use"
  | "tool_result"
  | "search_result";

/** 内容块 */
export interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
  /** 搜索结果相关字段 */
  searchResults?: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
}

/** 聊天消息 */
export interface Message {
  id: string;
  role: MessageRole;
  content: ContentBlock[];
  createdAt: number;
  /** 关联的 Skill ID */
  skillId?: string;
  /** 执行步骤 */
  steps?: MessageStep[];
}

/** 消息执行步骤 */
export interface MessageStep {
  id: string;
  type: "thinking" | "skill" | "generating" | "rendering" | "searching";
  label: string;
  status: "pending" | "running" | "completed";
  detail?: string;
}

/** 对话会话 */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  /** 所属项目 ID（可选） */
  projectId?: string;
}

/** 工具定义 */
export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/** 模型配置 */
export interface ModelConfig {
  id: string;
  name: string;
  provider: "openai" | "ollama" | "anthropic";
  baseUrl: string;
  apiKey: string;
  model: string;
  /** 最大输出 Token */
  maxTokens?: number;
  /** 温度（0-2） */
  temperature?: number;
  /** 上下文大小（Token 数） */
  contextSize?: number;
  /** 启用缓存 */
  enableCache?: boolean;
  /** 思考强度 */
  thinkingIntensity?: "low" | "medium" | "high";
}

/** 聊天选项 */
export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/** 流式响应块 */
export interface StreamChunk {
  type: "text" | "tool_use" | "tool_result" | "done";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}
