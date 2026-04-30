/** 模型适配器抽象接口 */
export interface ModelAdapter {
  /** 发送消息并获取流式响应 */
  streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatRequestOptions
  ): AsyncGenerator<import("@/types/chat").StreamChunk>;

  /** 检查模型是否可用 */
  isAvailable(): Promise<boolean>;

  /** 列出可用模型 */
  listModels(): Promise<Array<{ id: string; name: string }>>;
}

export interface ChatRequestOptions {
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}
