import type { ModelConfig, StreamChunk } from "@/types/chat";
import type { ModelAdapter, ChatRequestOptions } from "./model-adapter";

/** Ollama 本地模型适配器 */
export class OllamaAdapter implements ModelAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatRequestOptions
  ): AsyncGenerator<StreamChunk> {
    const url = `${this.config.baseUrl}/api/chat`;
    const body = JSON.stringify({
      model: this.config.model,
      messages,
      stream: true,
      options: {
        num_predict: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
      },
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      yield {
        type: "text",
        text: `Ollama 请求失败 (${response.status}): ${errorText}`,
      };
      yield { type: "done" };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: "text", text: "无法读取 Ollama 响应流" };
      yield { type: "done" };
      return;
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            yield { type: "text", text: parsed.message.content };
          }
          if (parsed.done) {
            yield { type: "done" };
            return;
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    yield { type: "done" };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return (data.models ?? []).map(
        (m: { name: string; model?: string }) => ({
          id: m.name,
          name: m.model ?? m.name,
        })
      );
    } catch {
      return [];
    }
  }
}
