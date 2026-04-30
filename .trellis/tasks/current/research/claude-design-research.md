# Claude Design 产品研究

- **查询**: Claude Artifacts、Claude Code CLI、Claude.ai UI 设计风格、Anthropic API、MCP 协议
- **范围**: 外部 / 官方文档
- **日期**: 2026-04-29

---

## 1. Claude Artifacts

### 功能概述

Artifacts 是 Claude 的核心功能，允许将对话中生成的实质性内容在独立窗口中展示，与主对话分离。这使得用户可以方便地修改、迭代和复用这些内容。

### 支持的内容类型

| 类型 | 文件扩展名 | 说明 |
|------|-----------|------|
| React 组件 | `.jsx` | 可交互 UI 组件，支持 Hooks（useState、useEffect） |
| HTML 页面 | `.html` | 自包含的 HTML/CSS/JavaScript 单文件 |
| Mermaid 图表 | `.mermaid` | 流程图、时序图、ER 图等 |
| SVG 图形 | `.svg` | 矢量图形，在线渲染 |
| Markdown 文档 | `.md` | 格式化文档和报告 |
| 代码文件 | 多种语言 | 语法高亮显示，带复制按钮 |

### 可用库和框架

React Artifacts 可导入以下库：

- **UI 框架**: React（组件和 Hooks）、Tailwind CSS（样式）
- **图表库**: Recharts、Chart.js、D3.js、Plotly
- **3D 图形**: Three.js (r128)
- **图标**: Lucide React (v0.383.0)
- **UI 组件**: shadcn/ui
- **音频**: Tone.js
- **数学**: mathjs
- **工具库**: lodash
- **数据处理**: Papaparse (CSV)、SheetJS (Excel)、mammoth (Word)
- **机器学习**: TensorFlow.js

### 代码沙箱环境

**关键约束**：

- **无 localStorage/sessionStorage**: 所有状态管理必须使用 React 的 `useState` 或 `useReducer`
- **沙箱安全模型**: 无法调用外部 API，网络请求受限
- **沙箱 iframe**: Artifacts 在隔离的 iframe 中渲染
- **浏览器兼容性**: 需要现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）

### AI 能力嵌入

Artifacts 支持嵌入 AI 能力：

1. 用户向 Claude 描述需求
2. Claude 生成代码
3. 应用在 Anthropic 基础设施上运行
4. 用户通过 Claude 账户认证并交互

### MCP 集成

- **支持计划**: Pro、Max、Team、Enterprise
- **平台**: Claude Web 和 Desktop
- **功能**: Artifacts 可通过 MCP 连接外部服务（Asana、Google Calendar、Slack 等）
- **自定义服务器**: 支持连接用户配置的自定义 MCP 服务器

---

## 2. Claude Code CLI

### 核心功能

Claude Code 是一个 Agentic 编码工具，将 Claude 模型转化为能够自主执行编程任务的智能体。

**核心能力**：

| 类别 | 功能 |
|------|------|
| 文件操作 | 读取、编辑、创建文件，按模式搜索文件，正则内容搜索 |
| 执行能力 | 运行 Shell 命令、启动服务器、运行测试、使用 Git |
| 代码智能 | 查看类型错误和警告、跳转定义、查找引用（需代码智能插件）|

### CLI 命令参考

```bash
# MCP 服务器配置
claude mcp add --transport stdio my-server npx -y @example/mcp-server

# 加载 MCP 配置文件
claude --mcp-config ./mcp.json

# Agent 模式
claude --agent my-custom-agent

# 自定义子代理
claude --agents '{"reviewer":{"description":"Reviews code","prompt":"You are a code reviewer"}}'

# 最小模式（跳过自动发现）
claude --bare -p "query"

# 限制工具
claude --tools "Bash,Edit,Read"

# 非交互模式
claude -p "query"
```

### Agent SDK

Claude Code SDK 已更名为 Claude Agent SDK，提供编程接口：

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Open example.com and describe what you see",
  options: {
    mcp_servers: {
      playwright: { command: "npx", args: ["@playwright/mcp@latest"] }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

### 扩展机制

| 特性 | 说明 | 位置 |
|------|------|------|
| Skills | Markdown 定义的专业能力 | `.claude/skills/*/SKILL.md` |
| Slash Commands | 常用任务的自定义命令 | `.claude/commands/*.md` |
| Memory | 项目上下文和指令 | `CLAUDE.md` 或 `.claude/CLAUDE.md` |
| Plugins | 扩展命令、代理和 MCP 服务器 | 通过 `plugins` 选项编程配置 |

---

## 3. Claude.ai UI 设计风格

### 配色方案

| 元素 | 颜色值 | 说明 |
|------|--------|------|
| 主背景 | `#f5f5f4` | 暖灰色背景，营造舒适阅读体验 |
| 卡片背景 | `#ffffff` | 纯白色，与背景形成对比 |
| 主文字 | `#1c1917` | 深色文字，高可读性 |
| 次文字 | `#57534e` | 中灰色，用于次要信息 |
| 边框 | `#e7e5e4` | 浅灰边框，柔和分隔 |
| 强调色 | `#d97706` | 琥珀色，用于高亮和交互 |

### 布局结构

```
┌─────────────────────────────────────────────────────┐
│                     Header                          │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  侧边栏   │            对话区域                      │
│          │         （居中，最大宽度限制）             │
│ - 历史   │                                          │
│ - 项目   │    ┌──────────────────────────────┐      │
│ - 设置   │    │      消息气泡                 │      │
│          │    └──────────────────────────────┘      │
│          │                                          │
│          │    ┌──────────────────────────────┐      │
│          │    │    Artifacts 预览面板         │      │
│          │    │    （右侧独立窗口）            │      │
│          │    └──────────────────────────────┘      │
│          │                                          │
│          │    ┌──────────────────────────────┐      │
│          │    │      输入区域                 │      │
│          │    └──────────────────────────────┘      │
└──────────┴──────────────────────────────────────────┘
```

### 交互设计

**消息气泡**：

- 用户消息：右对齐，深色背景
- Claude 消息：左对齐，浅色背景
- 圆角：`rounded-2xl` (16px)
- 内边距：`p-4` (16px)

**代码块**：

- 语法高亮：支持多种语言
- 行号显示：左侧显示
- 复制按钮：右上角悬浮
- 语言标签：左上角显示
- 背景：深色主题

**工具调用展示**：

- 折叠式设计，默认收起
- 展开后显示工具名称、参数、结果
- 状态指示器（成功/失败/运行中）

### 字体系统

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

- **代码字体**: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`
- **字号**: 基础 16px，标题层级递增

### 视觉效果

| 属性 | 值 | 用途 |
|------|-----|------|
| 圆角 | `8px` - `16px` | 卡片、按钮、输入框 |
| 阴影 | `0 1px 3px rgba(0,0,0,0.1)` | 卡片浮起效果 |
| 过渡 | `150ms ease` | 悬停、点击状态 |
| 边框宽度 | `1px` | 分隔线和边框 |

---

## 4. Anthropic API

### Messages API 格式

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ]
)
```

**响应结构**：

```json
{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help you today?"
    }
  ],
  "model": "claude-opus-4-20250514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 12,
    "output_tokens": 15
  }
}
```

### Tool Use 机制

**定义工具**：

```python
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather in a location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"]
        }
    }
]
```

**调用工具**：

```python
response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}]
)

# Claude 返回 tool_use 内容块
if response.stop_reason == "tool_use":
    for block in response.content:
        if block.type == "tool_use":
            # 执行工具并返回结果
            result = get_weather(block.input["location"])
            # 继续对话...
```

### Streaming 流式响应

```python
with client.messages.stream(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a poem"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Web Search 工具

```python
response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    tools=[{
        "type": "web_search_20250305",
        "name": "web_search"
    }],
    messages=[{"role": "user", "content": "What are the latest AI developments?"}]
)
```

---

## 5. MCP 协议

### 协议架构

MCP 遵循 Client-Host-Server 架构：

```
┌─────────────────────────────────────────────────────────┐
│                      MCP Host                           │
│  (Claude Code, Claude Desktop, AI-powered IDE)         │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ MCP Client  │  │ MCP Client  │  │ MCP Client  │    │
│  │     (1)     │  │     (2)     │  │     (3)     │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼───────────┘
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ MCP Server  │  │ MCP Server  │  │ MCP Server  │
   │  (本地/远程) │  │  (本地/远程) │  │  (本地/远程) │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### 核心概念

| 概念 | 说明 | 示例 |
|------|------|------|
| **Host** | 发起连接的 LLM 应用 | Claude Code、Claude Desktop |
| **Client** | Host 内部的连接器 | 每个 Server 一个 Client |
| **Server** | 提供上下文和能力的服务 | 数据库连接、API 集成 |

### 协议特性

**服务器特性**：

| 特性 | 说明 |
|------|------|
| **Tools** | AI 模型可调用的函数，支持读写数据库、调用 API、修改文件 |
| **Resources** | 只读数据源，提供文件内容、数据库模式、API 文档等上下文 |
| **Prompts** | 可复用的交互模板，如系统提示、few-shot 示例 |

**客户端特性**：

| 特性 | 说明 |
|------|------|
| **Sampling** | 服务器发起的 LLM 交互，支持递归行为 |
| **Roots** | 服务器发起的 URI/文件系统边界查询 |
| **Elicitation** | 服务器向用户请求额外信息 |

### 传输层

| 传输方式 | 适用场景 | 特点 |
|----------|----------|------|
| **stdio** | 本地资源 | 快速、同步消息传输 |
| **SSE** (Server-Sent Events) | 远程资源 | 高效、实时数据流 |

### 工具发现和调用

```json
// 1. 列出可用工具
// 请求: tools/list
// 响应:
{
  "tools": [
    {
      "name": "database_query",
      "description": "Query the database",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" }
        },
        "required": ["query"]
      }
    }
  ]
}

// 2. 调用工具
// 请求: tools/call
{
  "name": "database_query",
  "arguments": {
    "query": "SELECT * FROM users LIMIT 10"
  }
}
```

### 资源管理

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `resources/list` | 列出可用资源 | 资源描述符数组 |
| `resources/templates/list` | 发现资源模板 | 资源模板定义数组 |
| `resources/read` | 读取资源内容 | 带元数据的资源数据 |
| `resources/subscribe` | 监控资源变更 | 订阅确认 |

### 能力协商

MCP 使用基于能力的协商系统：

- **服务器声明**: 资源订阅支持、工具支持、提示模板
- **客户端声明**: Sampling 支持、通知处理
- 双方必须遵守声明的能力

---

## 关键发现总结

### Claude Artifacts 核心价值

1. **实时预览**: React 组件、HTML 页面即时渲染
2. **丰富生态**: 内置 Recharts、Three.js、D3.js 等专业库
3. **安全沙箱**: iframe 隔离，无 localStorage 限制
4. **MCP 扩展**: 可连接外部服务，构建交互式应用

### Claude Code CLI 架构

1. **Agent 循环**: 模型推理 + 工具执行的持续循环
2. **MCP 客户端内置**: 原生支持 MCP 服务器连接
3. **多扩展机制**: Skills、Hooks、Plugins、Subagents
4. **Agent SDK**: 支持 Python 和 TypeScript 编程控制

### UI 设计要点

1. **暖灰色背景 + 白色卡片**: 舒适的阅读体验
2. **居中对话布局**: 专注内容，减少干扰
3. **折工具调用**: 清晰展示执行过程
4. **系统字体栈**: 原生体验，快速加载

### MCP 协议价值

1. **标准化接口**: "AI 领域的 USB-C"
2. **三要素**: Tools（执行）、Resources（数据）、Prompts（模板）
3. **双向能力**: 服务器提供功能，客户端提供 Sampling
4. **灵活传输**: stdio 本地，SSE 远程

---

## 外部参考

- [Claude Help Center - Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference.md)
- [MCP Specification](https://modelcontextprotocol.io/specification/latest)
- [Claude Agent SDK - MCP](https://platform.claude.com/docs/en/agent-sdk/mcp)
- [Claude Lab - Artifacts Guide](https://claudelab.net/en/articles/claude-ai/artifacts-guide)
