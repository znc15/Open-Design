# 类型安全

> OpenDesign 前端类型系统约定。

---

## 类型组织

```
src/types/
├── chat.ts       # 聊天相关：Message, ContentBlock, StreamChunk, ModelConfig
├── skill.ts      # Skill 相关：Skill, SkillCategory
├── discovery.ts  # 发现功能类型
└── layout.ts     # 布局类型
```

- **共享类型** 放在 `src/types/` 下
- **组件局部类型** 放在组件文件内（interface 形式）
- **Store 类型** 定义在 store 文件的 interface 中

---

## 核心类型签名

### Message 类型

```ts
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: ContentBlock[];
  createdAt: number;
  skillId?: string;
  steps?: MessageStep[];
}
```

### ContentBlock 联合类型

```ts
type ContentBlockType = "text" | "image" | "tool_use" | "tool_result" | "search_result";

interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  source?: { type: "base64"; media_type: string; data: string };
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
  searchResults?: Array<{ title: string; url: string; content: string; score: number }>;
}
```

### ModelConfig 类型

```ts
interface ModelConfig {
  id: string;
  name: string;
  provider: "openai" | "ollama" | "anthropic";
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  contextSize?: number;
  enableCache?: boolean;
  thinkingIntensity?: "low" | "medium" | "high";
}
```

### StreamChunk 类型

```ts
interface StreamChunk {
  type: "text" | "tool_use" | "tool_result" | "done";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}
```

---

## 运行时验证

- 当前未使用 Zod 等运行时验证库
- API 边界数据（模型配置、搜索结果）通过 TypeScript 类型约束
- 未来建议在 API Route 入口添加 Zod schema 验证

---

## 常用模式

- **联合类型**：用于 `ContentBlockType`, `MessageRole`, `StreamChunk.type`
- **可选字段 + 默认值**：`maxTokens?: number` 配合 `config.maxTokens ?? 4096`
- **泛型工具**：`Record<string, unknown>` 用于动态 schema

---

## 禁止模式

| 模式 | 替代方案 |
|------|----------|
| `any` | `unknown` 或具体类型 |
| `as X` 类型断言 | 类型守卫或正确标注 |
| `@ts-ignore` | 修复类型错误 |
| `Record<string, any>` | `Record<string, unknown>` |
