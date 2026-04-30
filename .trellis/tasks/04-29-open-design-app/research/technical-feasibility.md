# Research: 技术可行性研究

- **Query**: Tauri 2.0 跨平台方案、多模型接入架构、设计编辑器技术选型、联网搜索集成
- **Scope**: 技术架构与选型
- **Date**: 2026-04-29

---

## 一、Tauri 2.0 + React + Next.js 跨平台方案

### 1.1 Tauri 2.0 架构概述

Tauri 是一个使用 Web 技术构建跨平台桌面和移动应用的框架：

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Next.js | 使用 WebView 渲染 |
| 后端 | Rust | 处理原生 API 调用 |
| 通信 | IPC | 前端与 Rust 后端通过 IPC 通信 |

**核心优势**：
- 包体积极小（~3-5MB，vs Electron ~150MB）
- 内存占用低（~50-100MB，vs Electron ~300-500MB）
- 安全性高（Rust 内存安全）
- 原生性能

### 1.2 Tauri 2.0 移动端支持

Tauri 2.0 正式支持移动端：
- **iOS**: 使用 Swift 桥接
- **Android**: 使用 Kotlin 桥接
- 同一套前端代码，编译为不同平台

### 1.3 Next.js 集成配置

Tauri 要求使用 **SSG（静态导出）** 模式，不支持 SSR：

```javascript
// next.config.js
const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig = {
  output: 'export',  // 静态导出模式
  images: {
    unoptimized: true,  // SSG 模式需要
  },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};
```

**Tauri 配置**：
```json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:3000",
    "frontendDist": "../out"
  }
}
```

### 1.4 Tauri vs Electron 对比

| 维度 | Tauri 2.0 | Electron |
|------|-----------|----------|
| 包体积 | 3-5 MB | 150+ MB |
| 内存占用 | 50-100 MB | 300-500 MB |
| 启动速度 | 快 | 较慢 |
| 后端语言 | Rust | Node.js |
| 移动端支持 | iOS/Android | 无 |
| 学习曲线 | 较陡（Rust） | 平缓 |
| 生态成熟度 | 较新 | 成熟 |

**推荐**：本项目选择 **Tauri 2.0**，因为：
1. 轻量级，用户体验更好
2. 支持移动端（未来扩展）
3. Rust 后端安全性高
4. 性能优势明显

---

## 二、多模型接入架构

### 2.1 统一模型接入层设计

目标：支持 OpenAI 兼容 API、MCP 协议、Ollama 本地模型

```
┌─────────────────────────────────────────────────────────────┐
│                      前端应用层                              │
│  (Chat UI / Design Editor / Code Editor)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    模型统一适配层                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ OpenAI API  │ │ MCP Client  │ │ Ollama API  │           │
│  │ Adapter     │ │ Adapter     │ │ Adapter     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                              │
│  统一接口: chat(messages, tools, options) → Stream<Response> │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      模型提供商                              │
│  Claude / GPT / Gemini / DeepSeek / Ollama / MCP Servers    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 统一消息格式

```typescript
// 统一消息格式
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: ContentBlock[];
}

interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  source?: { type: 'base64'; media_type: string; data: string };
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

// 统一工具定义
interface Tool {
  name: string;
  description: string;
  input_schema: JSONSchema;
}
```

### 2.3 Anthropic SDK 示例（TypeScript）

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// 流式响应
const stream = client.messages.stream({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  messages: [{ role: 'user', content: '设计一个登录页面' }],
  tools: [
    {
      name: 'web_search',
      type: 'web_search_20250305',
    },
  ],
})
.on('text', (text) => {
  process.stdout.write(text);
});

const finalMessage = await stream.finalMessage();
```

### 2.4 MCP 协议集成

MCP (Model Context Protocol) 是 Anthropic 开源的工具协议：

```typescript
// MCP Client 连接
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['mcp-server.js'],
});

const client = new Client({ name: 'design-app', version: '1.0.0' }, {});
await client.connect(transport);

// 获取可用工具
const tools = await client.listTools();

// 调用工具
const result = await client.callTool({
  name: 'search_web',
  arguments: { query: '最新设计趋势' },
});
```

### 2.5 Ollama 本地模型

```typescript
// Ollama REST API
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2',
    messages: [{ role: 'user', content: 'Hello' }],
    stream: true,
  }),
});

// 流式读取
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = new TextDecoder().decode(value);
  console.log(JSON.parse(chunk));
}
```

---

## 三、设计编辑器技术选型

### 3.1 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **HTML/CSS 直接渲染** | 简单、代码即设计、易于 AI 生成 | 无复杂图形操作 | v0/Lovable 模式 |
| **Canvas 渲染** | 高性能、复杂图形操作 | 实现复杂、无 DOM 语义 | Figma 模式 |
| **Fabric.js** | Canvas 封装、对象模型 | 学习曲线、性能开销 | 图形编辑器 |
| **Konva.js** | 高性能 Canvas、React 集成 | 功能有限 | 简单图形应用 |

### 3.2 推荐方案：混合架构

**核心思路**：借鉴 v0/Lovable 的模式，以 HTML/CSS 为主要渲染方式，辅以 Canvas 处理特殊图形。

```
┌─────────────────────────────────────────────────────────────┐
│                      设计画布                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              HTML/CSS 渲染层                         │   │
│  │  (React 组件树，支持拖拽、选择、编辑)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Canvas 覆盖层                           │   │
│  │  (绘制选择框、辅助线、缩略图预览)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**优势**：
1. AI 生成的代码可直接渲染
2. 支持实时预览和编辑
3. 导出代码即设计源码
4. 学习曲线低

### 3.3 拖拽与交互

推荐使用 **dnd-kit** 或 **@dnd-kit/core**：

```typescript
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function DesignCanvas() {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ComponentPalette />
      <DesignArea />
    </DndContext>
  );
}
```

---

## 四、联网搜索集成

### 4.1 搜索服务对比

| 服务 | 特点 | 定价 | 推荐场景 |
|------|------|------|----------|
| **Tavily** | AI 优化搜索、结构化结果 | 1000 次/月免费，$1/1000 次 | AI 应用首选 |
| **Exa** | 语义搜索、高质量结果 | 1000 次/月免费 | 研究型应用 |
| **Firecrawl** | 网页抓取 + 搜索 | 500 次/月免费 | 需要完整内容 |
| **Serper** | Google 搜索 API | 2500 次/月免费 | 通用搜索 |

### 4.2 推荐方案：Tavily

```typescript
// Tavily 搜索集成
const response = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TAVILY_API_KEY}`,
  },
  body: JSON.stringify({
    query: '2026 年 UI 设计趋势',
    search_depth: 'advanced',
    include_answer: true,
    include_raw_content: false,
    max_results: 5,
  }),
});

const data = await response.json();
// data.answer: AI 生成的答案
// data.results: 搜索结果列表
```

### 4.3 RAG 模式集成

将搜索结果注入 AI 对话：

```typescript
const messages = [
  {
    role: 'system',
    content: '你是一个设计助手。使用搜索结果回答用户问题。',
  },
  {
    role: 'user',
    content: `搜索结果：\n${searchResults}\n\n用户问题：${userQuery}`,
  },
];
```

---

## 五、推荐技术栈总结

### 5.1 完整技术栈

| 层级 | 技术选型 | 理由 |
|------|----------|------|
| **前端框架** | React 18 + TypeScript | 生态最大、类型安全 |
| **UI 库** | Tailwind CSS + shadcn/ui | Claude 风格、高度可定制 |
| **状态管理** | Zustand + TanStack Query | 轻量、服务端状态分离 |
| **跨平台** | Tauri 2.0 | 轻量、支持移动端 |
| **设计画布** | HTML/CSS + dnd-kit | AI 生成友好 |
| **代码编辑器** | Monaco Editor | VS Code 同款 |
| **模型接入** | Anthropic SDK + MCP SDK | 官方支持 |
| **搜索服务** | Tavily | AI 优化 |
| **后端服务** | Supabase | 认证、数据库、存储 |

### 5.2 项目结构

```
open-design/
├── src/                      # 前端源码
│   ├── app/                  # Next.js App Router
│   ├── components/           # React 组件
│   │   ├── chat/             # 对话界面
│   │   ├── canvas/           # 设计画布
│   │   ├── editor/           # 代码编辑器
│   │   └── ui/               # 基础 UI 组件
│   ├── lib/                  # 核心库
│   │   ├── models/           # 模型适配层
│   │   ├── mcp/              # MCP 客户端
│   │   └── search/           # 搜索集成
│   ├── stores/               # Zustand 状态
│   └── types/                # TypeScript 类型
├── src-tauri/                # Tauri Rust 后端
│   ├── src/
│   └── tauri.conf.json
├── research/                 # 研究文档
└── .trellis/                 # Trellis 工作流
```

### 5.3 开发阶段规划

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| **Phase 1** | 基础架构 + 对话界面 | P0 |
| **Phase 2** | 模型接入层 + 多模型支持 | P0 |
| **Phase 3** | 设计画布 + 代码编辑器 | P0 |
| **Phase 4** | 搜索集成 + RAG | P1 |
| **Phase 5** | Tauri 桌面端打包 | P1 |
| **Phase 6** | 用户系统 + 云同步 | P2 |
| **Phase 7** | 移动端适配 | P2 |

---

## 六、参考资料

- [Tauri 2.0 官方文档](https://v2.tauri.app/)
- [Anthropic SDK TypeScript](https://github.com/anthropics/anthropic-sdk-typescript)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [Tavily API 文档](https://docs.tavily.com/)
- [shadcn/ui](https://ui.shadcn.com/)
