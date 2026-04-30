# brainstorm: OpenDesign 5大功能增强

## Goal

为 OpenDesign AI 设计应用新增 5 项核心能力：侧边栏对话历史管理、多文件代码编辑（支持 React/Vue 等框架）、Skill 系统 + 默认 front-design skill、项目管理、联网搜索。这些功能将 OpenDesign 从单次对话设计工具升级为完整的设计开发平台。

## What I already know

### 项目现状

- **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Zustand
- **布局**: 左侧对话面板 + 右侧预览/代码切换，对话面板可折叠
- **对话系统**: 已实现多对话管理（conversations），支持新建/切换/删除/重命名，持久化到 localStorage
- **代码编辑器**: 当前是简单 textarea，仅支持 HTML/CSS/JS 三选一
- **模型接入**: OpenAI 兼容 API + Ollama + MCP 适配器，统一 ModelService
- **画布**: HTML/CSS 实时渲染预览，代码-画布单向同步（AI 回复 → 提取代码 → 渲染）
- **搜索**: `src/lib/search/` 目录为空，PRD 提到 Tavily 但未实现
- **项目管理**: 无项目概念，仅全局画布状态
- **Skill 系统**: 无任何实现

### 关键文件

- `open-design/src/stores/chat-store.ts` — 对话状态管理，多对话 CRUD + 流式发送
- `open-design/src/stores/canvas-store.ts` — 画布状态，单一代码编辑区
- `open-design/src/stores/app-store.ts` — 应用级状态（面板开关等）
- `open-design/src/services/model-service.ts` — 模型服务，适配器工厂
- `open-design/src/services/model-adapter.ts` — 模型适配器接口
- `open-design/src/components/editor/code-editor.tsx` — 当前 textarea 编辑器
- `open-design/src/components/chat/conversation-list.tsx` — 对话列表（max-h-40，嵌在面板顶部）
- `open-design/src/components/layout/sidebar.tsx` — 已弃用（标记 @deprecated）
- `open-design/src/types/chat.ts` — 消息/对话/模型类型定义
- `open-design/src/app/page.tsx` — 主页面布局
- `open-design/package.json` — 已有 Monaco Editor 依赖（@monaco-editor/react）

## Assumptions (temporary)

1. 多文件编辑采用虚拟文件系统（内存中），不依赖真实文件系统
2. Skill 系统基于 system prompt 模板注入，不涉及插件式动态加载
3. 联网搜索通过 Tavily API 实现（与 PRD 一致）
4. 项目管理为本地管理（localStorage），不涉及后端/云同步
5. React/Vue 库支持通过 system prompt 注入框架模板和 CDN 引用实现

## Open Questions

1. **Skill 系统 UI 形态**: Skill 选择器放在哪里？对话输入区上方 / 侧边栏独立 tab / 模型选择器旁边？
2. **多文件编辑范围**: 是否支持用户手动创建文件，还是仅由 AI 生成多文件？
3. **项目管理的持久化粒度**: 项目保存什么？（对话历史 + 代码文件 + 设置 / 仅代码文件）
4. **联网搜索触发方式**: 自动触发（AI 判断需要搜索时）/ 手动触发（用户点击搜索按钮）/ 两者兼有？

## Requirements (evolving)

### F1: 侧边栏对话历史管理

- 将 `ConversationList` 从对话面板顶部抽出，移入独立侧边栏
- 侧边栏可折叠/展开，位于主内容区左侧
- 支持对话分组/搜索
- 对话自动命名（取首条消息前 20 字符）— 已实现

### F2: 多文件代码编辑 + React/Vue 支持

- 集成 Monaco Editor（已在 package.json 中）
- 多文件 tab 切换
- 支持文件类型：HTML、CSS、JS/TSX/JSX、Vue SFC
- AI 生成代码时支持生成多文件输出
- system prompt 注入框架模板（React CDN、Vue CDN 等）

### F3: Skill 系统 + 默认 front-design skill

- Skill 定义：名称、描述、system prompt 模板、关联模型配置
- Skill 选择 UI
- 默认 front-design skill：专注前端 UI 设计生成
- Skill 注入到对话上下文

### F4: 项目管理

- 项目 CRUD（创建、切换、删除、重命名）
- 项目级隔离（对话历史、代码文件、设置）
- 项目列表侧边栏展示
- 项目导出（下载代码文件）

### F5: 联网搜索

- Tavily API 集成
- 搜索结果注入对话上下文
- 来源引用展示
- 搜索触发方式待定

## Acceptance Criteria (evolving)

- [ ] 侧边栏独立展示对话历史，可折叠展开
- [ ] Monaco Editor 替换 textarea，支持多文件 tab
- [ ] AI 可生成 React/Vue 框架代码并在画布中正确渲染
- [ ] Skill 选择器可用，front-design skill 可正常工作
- [ ] 项目 CRUD 完整可用
- [ ] 联网搜索返回结果并展示来源引用

## Definition of Done

- 所有新功能在 dev 模式下可运行
- TypeScript 编译无错误
- 新增 store 有 persist 配置
- UI 交互流畅，无明显布局错乱

## Out of Scope (explicit)

- 后端服务 / 云同步 / 用户认证
- Tauri 桌面端打包
- 代码 Git 版本控制
- 实时协作

## Technical Notes

- 已有依赖 @monaco-editor/react，无需额外安装
- 已有依赖 @dnd-kit（可用于拖拽排序）
- shadcn/ui 组件库已配置（components.json）
- Zustand persist 已用于 chat-store 和 canvas-store
- Next.js 16 有 breaking changes（参考 AGENTS.md）
