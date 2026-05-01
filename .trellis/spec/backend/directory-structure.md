# 目录结构

> OpenDesign 后端代码组织方式（Next.js API Routes + 服务层）。

---

## 目录布局

```
src/
├── app/api/                    # Next.js API Routes（BFF 层）
│   └── export-figma/           # Figma 导出端点
│       └── route.ts            # POST handler
├── services/                   # 服务层（模型适配器）
│   ├── model-adapter.ts        # 适配器抽象接口 ModelAdapter
│   ├── model-service.ts        # 模型服务单例 ModelService
│   ├── openai-adapter.ts       # OpenAI 兼容适配器
│   ├── ollama-adapter.ts       # Ollama 适配器
│   └── mcp-adapter.ts          # MCP 适配器
├── lib/
│   ├── utils.ts                # cn() 工具函数
│   ├── search/                 # 联网搜索
│   │   └── tavily.ts           # Tavily 搜索服务
│   └── prompts/                # Prompt 模板
│       └── system.ts           # 系统 prompt 生成
└── types/                      # 共享类型定义
```

---

## 架构说明

OpenDesign 是一个 **前端为主的应用**，后端能力由以下两部分组成：

1. **API Routes**：Next.js App Router 的 `route.ts` 文件，处理 HTTP 请求
2. **服务层**：`services/` 下的模型适配器，在客户端通过 Zustand store 调用

> 注意：模型适配器（`services/`）目前运行在客户端，通过 `AsyncGenerator` 实现流式响应。API Routes 仅用于需要服务端密钥的场景（如 Figma 导出）。

---

## 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| API Route 目录 | kebab-case | `export-figma/` |
| API Route 文件 | 固定 `route.ts` | `route.ts` |
| 服务文件 | kebab-case | `model-service.ts` |
| 类名 | PascalCase | `ModelService`, `OpenAIAdapter` |
| 接口名 | PascalCase + 前缀 | `ModelAdapter` |

---

## 导入路径

- 使用 `@/*` 路径别名映射 `./src/*`
- 服务层内部使用相对路径：`./model-adapter`
- 跨层引用使用别名：`@/types/chat`
