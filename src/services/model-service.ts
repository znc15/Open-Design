import type { ModelConfig, StreamChunk, Message } from "@/types/chat";
import type { ChatRequestOptions } from "./model-adapter";
import { OpenAIAdapter } from "./openai-adapter";
import { OllamaAdapter } from "./ollama-adapter";
import { MCPAdapter } from "./mcp-adapter";

export type { ChatRequestOptions } from "./model-adapter";
export type { ModelAdapter } from "./model-adapter";
export { OpenAIAdapter } from "./openai-adapter";
export { OllamaAdapter } from "./ollama-adapter";
export { MCPAdapter } from "./mcp-adapter";

/** 根据模型配置创建对应适配器 */
function createAdapter(config: ModelConfig): OpenAIAdapter | OllamaAdapter | MCPAdapter {
  switch (config.provider) {
    case "ollama":
      return new OllamaAdapter(config);
    case "anthropic":
      // Anthropic 暂走 MCP 适配器（通过兼容网关转发）
      return new MCPAdapter(config, config.baseUrl);
    case "openai":
    default:
      return new OpenAIAdapter(config);
  }
}

/** 将内部消息格式转换为适配器所需的简化格式 */
function toAdapterMessages(messages: Message[]): Array<{ role: string; content: string }> {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join(""),
  }));
}

/** 模型服务单例 */
class ModelService {
  private abortController: AbortController | null = null;

  /** 流式发送消息（支持 Message[] 或简化格式） */
  async *sendMessage(
    config: ModelConfig,
    messages: Message[] | Array<{ role: string; content: string }>,
    options?: ChatRequestOptions
  ): AsyncGenerator<StreamChunk> {
    this.abort();

    const controller = new AbortController();
    this.abortController = controller;

    const adapter = createAdapter(config);

    // 支持两种消息格式
    let adapterMessages: Array<{ role: string; content: string }>;
    if (messages.length > 0 && "content" in messages[0] && typeof messages[0].content === "string") {
      // 已经是简化格式
      adapterMessages = messages as Array<{ role: string; content: string }>;
    } else {
      // 需要转换
      adapterMessages = toAdapterMessages(messages as Message[]);
    }

    yield* adapter.streamChat(adapterMessages, {
      ...options,
      signal: controller.signal,
    });
  }

  /** 中止当前请求 */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /** 检查模型可用性 */
  async checkAvailability(config: ModelConfig): Promise<boolean> {
    const adapter = createAdapter(config);
    return adapter.isAvailable();
  }

  /** 列出可用模型 */
  async listModels(config: ModelConfig): Promise<Array<{ id: string; name: string }>> {
    const adapter = createAdapter(config);
    return adapter.listModels();
  }
}

export const modelService = new ModelService();
