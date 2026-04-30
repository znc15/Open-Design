import type { ModelConfig, StreamChunk } from "@/types/chat";
import type { ModelAdapter, ChatRequestOptions } from "./model-adapter";

/**
 * MCP (Model Context Protocol) 客户端适配器
 * 通过 HTTP SSE 与 MCP 服务器通信
 */
export class MCPAdapter implements ModelAdapter {
  private config: ModelConfig;
  private serverUrl: string;

  constructor(config: ModelConfig, serverUrl: string) {
    this.config = config;
    this.serverUrl = serverUrl;
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatRequestOptions
  ): AsyncGenerator<StreamChunk> {
    // MCP 通过 /messages 端点发送消息
    const url = `${this.serverUrl}/messages`;
    const body = JSON.stringify({
      model: this.config.model,
      messages,
      stream: true,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey
          ? { Authorization: `Bearer ${this.config.apiKey}` }
          : {}),
      },
      body,
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      yield {
        type: "text",
        text: `MCP 请求失败 (${response.status}): ${errorText}`,
      };
      yield { type: "done" };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: "text", text: "无法读取 MCP 响应流" };
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
        if (!trimmed) continue;

        // SSE 格式：data: {...}
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            yield { type: "done" };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            // MCP 返回格式适配
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield { type: "text", text: parsed.delta.text };
            } else if (parsed.type === "tool_use") {
              yield {
                type: "tool_use",
                id: parsed.id,
                name: parsed.name,
                input: parsed.input,
              };
            } else if (parsed.type === "tool_result") {
              yield {
                type: "tool_result",
                tool_use_id: parsed.tool_use_id,
                content: parsed.content,
              };
            } else if (parsed.choices?.[0]?.delta?.content) {
              // 兼容 OpenAI 格式的 MCP 响应
              yield { type: "text", text: parsed.choices[0].delta.content };
            }
          } catch {
            // 跳过无法解析的行
          }
        }
      }
    }

    yield { type: "done" };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.serverUrl}/models`);
      if (!response.ok) return [];

      const data = await response.json();
      return (data.models ?? data.data ?? []).map(
        (m: { id?: string; name?: string; model?: string }) => ({
          id: m.id ?? m.name ?? m.model ?? "",
          name: m.name ?? m.id ?? m.model ?? "",
        })
      );
    } catch {
      return [];
    }
  }
}
