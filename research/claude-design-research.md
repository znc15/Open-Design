# Research: Claude Design / Claude Code / MCP 协议产品研究

- **Query**: Claude Artifacts、Claude Code CLI、MCP 协议、Claude.ai UI 风格
- **Scope**: 产品特性与技术架构
- **Date**: 2026-04-29

---

## 一、Claude Artifacts

### 1.1 产品概述

Claude Artifacts 是 Anthropic 在 Claude.ai 中推出的结构化内容生成功能。用户在对话中生成的代码、文档、图表等内容会被提取为独立的"Artifact"，在侧边预览面板中实时展示。

### 1.2 支持的内容类型

| 类型 | 说明 |
|------|------|
| **代码** | React/HTML/SVG/Mermaid 等，支持实时预览 |
| **文档** | Markdown 格式，支持渲染预览 |
| **图表** | Mermaid/PlantUML 语法，自动渲染 |
| **React 组件** | 在沙箱环境中执行，支持交互预览 |
| **SVG 图形** | 矢量图形生成和预览 |

### 1.3 交互模式

```
┌─────────────────────────────────────────────────────────────┐
│  Claude.ai 界面                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │     对话区域          │  │     Artifact 预览          │  │
│  │                      │  │                            │  │
│  │  User: 做一个仪表盘  │  │  ┌──────────────────────┐  │  │
│  │                      │  │  │                      │  │  │
│  │  Claude: 好的，这是  │  │  │  React 组件实时渲染   │  │  │
│  │  你的仪表盘组件...   │  │  │  (可交互、可编辑)     │  │  │
│  │                      │  │  │                      │  │  │
│  │                      │  │  └──────────────────────┘  │  │
│  └──────────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 代码沙箱

- 使用 Web Worker 隔离执行
- 支持 React/ReactDOM 运行时
- 可注入第三方库（通过 CDN importmap）
- 限制文件系统和网络访问

---

## 二、Claude Code CLI

### 2.1 产品概述

Claude Code 是 Anthropic 官方的 AI 编程助手 CLI 工具，支持：
- 终端交互式对话
- 代码读取、编辑、创建
- Shell 命令执行
- MCP 工具扩展
- Agent 子任务委派

### 2.2 核心功能

| 功能 | 描述 |
|------|------|
| **文件操作** | Read/Write/Edit/Glob/Grep 等原生工具 |
| **Shell 执行** | Bash 命令运行，支持后台执行 |
| **Agent 模式** | 生成子 Agent 处理复杂任务 |
| **MCP 集成** | 通过 MCP 协议扩展工具能力 |
| **多模型切换** | Opus/Sonnet/Haiku 模型选择 |
| **Plan Mode** | 先规划后执行的审批流 |
| **Team 协作** | 多 Agent 团队协作模式 |

### 2.3 工具系统架构

```
用户输入
   │
   ▼
┌─────────────────────────────────────┐
│          Claude Code 主循环          │
│                                      │
│  ┌───────────┐    ┌───────────────┐ │
│  │ 内置工具   │    │ MCP 工具      │ │
│  │ - Read     │    │ - 用户提供    │ │
│  │ - Write    │    │ - 第三方服务  │ │
│  │ - Edit     │    │ - 自定义脚本  │ │
│  │ - Bash     │    └───────────────┘ │
│  │ - Grep     │                      │
│  │ - Glob     │    ┌───────────────┐ │
│  │ - Agent    │    │ Agent 子任务   │ │
│  └───────────┘    │ - Explore     │ │
│                    │ - Plan        │ │
│                    │ - Execute     │ │
│                    └───────────────┘ │
└─────────────────────────────────────┘
```

---

## 三、Claude.ai UI 设计风格

### 3.1 配色方案

| 用途 | 色值 | 说明 |
|------|------|------|
| 背景主色 | `#f5f5f4` (stone-100) | 暖灰色，柔和 |
| 卡片/面板 | `#ffffff` | 纯白 |
| 主文字 | `#1c1917` (stone-900) | 深灰近黑 |
| 辅助文字 | `#78716c` (stone-500) | 中灰色 |
| 强调色 | `#d97706` (amber-600) | 暖橙琥珀色 |
| 链接 | `#2563eb` (blue-600) | 蓝色 |
| 代码背景 | `#1e1e2e` | 深色（Catppuccin 风格） |
| 边框 | `#e7e5e4` (stone-200) | 浅灰 |

### 3.2 字体

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
```

| 层级 | 字号 | 字重 |
|------|------|------|
| 页面标题 | 24px | 600 |
| 区域标题 | 18px | 600 |
| 正文 | 14-16px | 400 |
| 辅助文字 | 12-13px | 400 |
| 代码 | 13px (monospace) | 400 |

### 3.3 布局模式

```
┌─────────────────────────────────────────────────────────────┐
│  顶栏 (Logo + 模型选择 + 设置)                               │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  侧边栏   │              主内容区                            │
│  - 历史   │                                                  │
│  - 项目   │     ┌─────────────────────────────┐             │
│  - 工具   │     │     对话消息流               │             │
│          │     │     - 用户消息 (右对齐)        │             │
│          │     │     - AI 回复 (左对齐)         │             │
│          │     │     - 代码块 (语法高亮)        │             │
│          │     │     - 工具调用 (折叠展示)      │             │
│          │     └─────────────────────────────┘             │
│          │                                                  │
│          │     ┌─────────────────────────────┐             │
│          │     │     输入框                    │             │
│          │     │     (自动扩展 textarea)       │             │
│          │     │     [附件] [发送]             │             │
│          │     └─────────────────────────────┘             │
├──────────┴──────────────────────────────────────────────────┤
│  状态栏 (模型信息 + Token 用量)                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 交互特点

- **消息气泡**：用户消息右对齐，AI 回复左对齐，无头像
- **代码块**：深色背景，语法高亮，支持一键复制
- **工具调用**：折叠式展示，显示工具名、输入参数、执行结果
- **流式输出**：逐字显示，带闪烁光标效果
- **输入框**：底部固定，自动扩展高度，Shift+Enter 换行
- **附件**：支持文件上传、图片粘贴

### 3.5 圆角与阴影

```css
/* 卡片/面板 */
border-radius: 8px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* 按钮 */
border-radius: 6px;

/* 输入框 */
border-radius: 12px;
border: 1px solid #e7e5e4;

/* 对话气泡 */
border-radius: 16px;
```

### 3.6 过渡动效

- 消息出现：淡入 + 轻微上移 (150ms ease)
- 面板展开：滑入 + 淡入 (200ms ease)
- 按钮悬停：背景色渐变 (100ms)
- 流式文字：逐字符显示，尾部闪烁光标

---

## 四、Anthropic API 核心机制

### 4.1 Messages API

```typescript
// 基本消息请求
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  system: '你是一个设计助手',
  messages: [
    { role: 'user', content: '设计一个登录页面' }
  ],
});
```

### 4.2 Tool Use / Function Calling

```typescript
// 定义工具
const tools = [{
  name: 'generate_component',
  description: '生成 React UI 组件',
  input_schema: {
    type: 'object',
    properties: {
      component_type: { type: 'string', enum: ['button', 'card', 'form', 'layout'] },
      description: { type: 'string' },
      style: { type: 'string', enum: ['modern', 'minimal', 'playful'] },
    },
    required: ['component_type', 'description'],
  },
}];

// 模型返回 tool_use 块，客户端执行后返回 tool_result
```

### 4.3 Streaming 流式响应

```typescript
const stream = client.messages.stream({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  messages: [...],
})
.on('text', (text) => updateUI(text))
.on('message', (msg) => handleComplete(msg));

const final = await stream.finalMessage();
```

### 4.4 Web Search 工具

```typescript
// 内置 web_search 工具
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  messages: [{ role: 'user', content: '最新的设计趋势' }],
  tools: [{ name: 'web_search', type: 'web_search_20250305' }],
});
```

---

## 五、MCP (Model Context Protocol)

### 5.1 协议概述

MCP 是 Anthropic 开源的标准化协议，用于 AI 模型与外部工具/数据源的通信。

**核心概念**：
- **Client**: 嵌入在 AI 应用中的客户端
- **Server**: 提供工具、资源、提示的服务端
- **Transport**: 通信方式（stdio、SSE、HTTP）

### 5.2 能力类型

| 能力 | 描述 | 示例 |
|------|------|------|
| **Tools** | 可调用的函数 | search_web、read_file、generate_image |
| **Resources** | 可读取的数据源 | 文件、数据库记录、API 响应 |
| **Prompts** | 预定义的提示模板 | 设计审查、代码生成模板 |

### 5.3 工具发现和调用流程

```
1. Client 连接 Server (通过 Transport)
2. Client 调用 listTools() → 获取工具列表
3. 模型根据用户意图选择工具
4. Client 调用 callTool(name, args) → 获取结果
5. 将结果返回给模型继续对话
```

### 5.4 SDK 集成

```typescript
// MCP Client
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({ name: 'design-app', version: '1.0.0' });
await client.connect(transport);

// 发现工具
const { tools } = await client.listTools();

// 调用工具
const result = await client.callTool({
  name: 'search_design_inspiration',
  arguments: { query: 'minimalist dashboard', style: 'modern' },
});
```

---

## 六、可借鉴的核心设计要点

### 6.1 对话驱动的设计流程

- 用户通过自然语言描述设计需求
- AI 理解意图后生成设计代码/组件
- 实时预览和交互式修改
- 对话历史作为设计上下文

### 6.2 工具扩展架构

- MCP 协议作为工具扩展标准
- 插件式架构，用户可自定义工具
- 内置搜索、代码生成、预览等核心工具

### 6.3 Claude 风格 UI 要点

1. **暖色调**：stone 色系 + amber 强调色
2. **极简布局**：大量留白，内容居中
3. **流畅动效**：淡入、滑入、逐字显示
4. **信息密度**：工具调用折叠，代码块紧凑
5. **输入体验**：底部固定输入框，自动扩展

### 6.4 技术实现借鉴

| Claude 特性 | 借鉴方案 |
|-------------|----------|
| Artifacts 沙箱 | iframe + postMessage 隔离渲染 |
| 流式输出 | SSE + React state 渐进更新 |
| 工具调用 | 统一 Tool 接口 + MCP 协议 |
| 多模型 | 适配器模式 + 统一消息格式 |
| 代码高亮 | Shiki / Prism 语法高亮 |

---

## 七、参考资料

- [Anthropic API 文档](https://docs.anthropic.com/)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Anthropic SDK TypeScript](https://github.com/anthropics/anthropic-sdk-typescript)
