# 目录结构

> OpenDesign 前端代码组织方式。

---

## 目录布局

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（主应用入口）
│   └── api/                # API Routes（BFF 层）
│       └── export-figma/   # Figma 导出端点
├── components/
│   ├── ui/                 # shadcn/ui 基础组件（button, card, dialog...）
│   ├── canvas/             # 画布预览与编辑器视图
│   ├── chat/               # 对话面板（消息列表、输入框、Skill 选择器...）
│   ├── editor/             # Monaco 代码编辑器
│   ├── export/             # 导出功能（Figma 等）
│   ├── layout/             # 布局组件（侧边栏、头部、状态栏）
│   └── settings/           # 设置面板
├── stores/                 # Zustand 状态管理
│   ├── app-store.ts        # 全局 UI 状态
│   ├── canvas-store.ts     # 画布状态
│   ├── chat-store.ts       # 对话与模型状态
│   ├── project-store.ts    # 项目管理状态
│   ├── skill-store.ts      # Skill 状态
│   ├── sidebar-store.ts    # 侧边栏状态
│   └── todo-store.ts       # 待办状态
├── services/               # 服务层（模型适配器）
│   ├── model-adapter.ts    # 适配器抽象接口
│   ├── model-service.ts    # 模型服务单例
│   ├── openai-adapter.ts   # OpenAI 适配器
│   ├── ollama-adapter.ts   # Ollama 适配器
│   └── mcp-adapter.ts      # MCP 适配器
├── lib/
│   ├── utils.ts            # cn() 工具函数
│   ├── search/             # 联网搜索（Tavily）
│   └── prompts/            # Prompt 模板
├── types/                  # TypeScript 类型定义
│   ├── chat.ts             # 聊天相关类型
│   ├── skill.ts            # Skill 类型
│   ├── discovery.ts        # 发现功能类型
│   └── layout.ts           # 布局类型
└── hooks/                  # 自定义 Hooks（待建立）
```

---

## 模块组织规则

- **按功能域分组**：`components/` 下按功能域（canvas, chat, editor, layout, settings）组织，不是按技术角色
- **每个域有 `index.ts`**：作为 barrel 导出，只导出该域的公开组件
- **`ui/` 目录不可手动修改**：由 shadcn CLI 生成，自定义组件放对应功能域
- **stores 与组件一一对应**：每个功能域有独立的 Zustand store

---

## 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | kebab-case | `design-canvas.tsx`, `chat-input.tsx` |
| 组件名 | PascalCase | `DesignCanvas`, `ChatInput` |
| Store 文件 | kebab-case + `-store` | `canvas-store.ts` |
| Store hook | `use` + PascalCase + `Store` | `useCanvasStore` |
| 类型文件 | kebab-case | `chat.ts` |
| 工具函数 | camelCase | `cn()`, `extractCodeFromMarkdown()` |
| 目录 | kebab-case | `canvas/`, `chat/`, `model-selector/` |

---

## 导入路径

- 使用 `@/*` 路径别名映射 `./src/*`
- 禁止相对路径跨域导入（如 `../../chat/xxx`），应使用 `@/components/chat/xxx`
- 同域内允许相对路径（如 `./sub-component`）
