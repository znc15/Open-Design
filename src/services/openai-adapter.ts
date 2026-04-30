import type { ModelConfig, StreamChunk } from "@/types/chat";
import type { ModelAdapter, ChatRequestOptions } from "./model-adapter";

/** OpenAI 兼容 API 适配器（同时适用于 OpenAI、DeepSeek、通义千问等） */
export class OpenAIAdapter implements ModelAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatRequestOptions
  ): AsyncGenerator<StreamChunk> {
    const url = `${this.config.baseUrl}/chat/completions`;
    const body = JSON.stringify({
      model: this.config.model,
      messages,
      stream: true,
      max_tokens: this.config.maxTokens ?? options?.maxTokens ?? 4096,
      temperature: this.config.temperature ?? options?.temperature ?? 0.7,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body,
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      yield {
        type: "text",
        text: `请求失败 (${response.status}): ${errorText}`,
      };
      yield { type: "done" };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: "text", text: "无法读取响应流" };
      yield { type: "done" };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          yield { type: "done" };
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            yield { type: "text", text: delta.content };
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
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      if (!response.ok) return [];

      const data = await response.json();
      return (data.data ?? []).map(
        (m: { id: string }) => ({ id: m.id, name: m.id })
      );
    } catch {
      return [];
    }
  }
}
