# Backend Development Guidelines

> OpenDesign 后端/服务层开发规范索引。

---

## 架构说明

OpenDesign 是 **前端为主的应用**，后端能力由两部分组成：

1. **API Routes**：Next.js App Router 的 `route.ts`，处理需要服务端密钥的请求
2. **服务层**：`services/` 下的模型适配器，运行在客户端

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | 目录组织、API Routes、服务层架构 | ✅ 已填充 |
| [Database Guidelines](./database-guidelines.md) | localStorage 持久化、未来迁移路径 | ✅ 已填充 |
| [Error Handling](./error-handling.md) | 错误分类、传播模式、用户提示 | ✅ 已填充 |
| [Quality Guidelines](./quality-guidelines.md) | 禁止模式、API Route 规范、审查清单 | ✅ 已填充 |
| [Logging Guidelines](./logging-guidelines.md) | 日志级别、格式、禁止模式 | ✅ 已填充 |

---

## Quick Reference

### API Route 模板

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.required) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }
    const result = await process(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API 错误:", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
```

### 模型适配器接口

```ts
interface ModelAdapter {
  streamChat(messages, options?): AsyncGenerator<StreamChunk>;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<Array<{ id: string; name: string }>>;
}
```

---

## 核心服务速查

- `ModelService`: 模型服务单例，统一管理适配器
- `OpenAIAdapter`: OpenAI 兼容 API（DeepSeek、通义千问等）
- `OllamaAdapter`: Ollama 本地模型
- `MCPAdapter`: MCP 协议适配器（Anthropic）
- `tavilySearch()`: Tavily 联网搜索

详见 [Directory Structure](./directory-structure.md)。