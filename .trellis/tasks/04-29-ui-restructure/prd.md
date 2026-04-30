# UI重构 - 侧边栏对话+右侧预览+美化+导出

## Goal

将 OpenDesign 从标签页视图重构为左右分栏布局：左侧 AI 对话、右侧实时设计预览；美化 AI 输出渲染；支持导出为可编辑的 Figma 设计稿。

## Requirements

### R1: 左右分栏布局
- 左侧：AI 对话面板（消息列表 + 输入框），宽度可拖拽调整
- 右侧：设计预览面板（iframe 预览 + 代码编辑器切换）
- 中间可拖拽分隔条，支持调整分割比例
- 移除当前标签页切换机制（chat/canvas/editor 标签）
- 设置页改为右侧面板入口或对话框

### R2: 美化 AI 输出
- Markdown 渲染：标题、列表、粗体、链接、表格、引用（使用 react-markdown + remark-gfm）
- 代码块语法高亮（使用 rehype-pretty-code + shiki，VSCode 级别高亮）
- 流式输出光标闪烁动画（CSS `@keyframes blink`）
- 流式输出时平滑自动滚动
- 代码块复制按钮

### R3: Figma 导出（可编辑节点结构）
- 采用 code.to.design API（Clipboard 模式）
- 用户点击"导出到 Figma" → 后端调用 API → 前端加载到剪贴板 → 用户在 Figma 中 Ctrl+V 粘贴
- 转换结果为可编辑的 Figma 图层，非截图
- 降级方案：同时提供 HTML 源码复制 + 截图下载

### R4: 全局美化
- 打磨所有页面视觉效果
- 统一动画和过渡效果
- 优化空状态、加载状态展示

### R5: 测试
- 验证布局切换功能正常
- 验证流式输出渲染效果
- 验证 Figma 导出流程

## Acceptance Criteria

- [ ] 主页面为左右分栏：左侧对话、右侧预览
- [ ] 分隔条可拖拽调整宽度（有最小/最大限制）
- [ ] AI 消息支持完整 Markdown 渲染（GFM）
- [ ] 代码块有语法高亮和复制按钮
- [ ] 流式输出有光标闪烁动画和平滑滚动
- [ ] "导出到 Figma" 按钮可用，复制剪贴板后可在 Figma 粘贴为可编辑图层
- [ ] 全局视觉效果统一打磨
- [ ] 无 TypeScript 类型错误

## Definition of Done

- 所有 Acceptance Criteria 通过
- 无 console 错误（功能相关）
- 流式输出、布局调整无性能卡顿

## Technical Approach

### 布局重构
1. `page.tsx` 改为固定左右分栏（非标签切换）
2. 左侧直接嵌入 MessageList + ChatInput
3. 右侧嵌入 DesignCanvas + 可折叠的 CodeEditor
4. 中间添加拖拽分隔条组件（参考 canvas-editor-view.tsx 已有实现）
5. app-store 中 currentView 简化或移除，sidebarOpen 保留但用于折叠左侧对话面板

### Markdown 渲染
- 安装：`react-markdown` `remark-gfm` `rehype-pretty-code` `shiki`
- message-bubble.tsx 改用 ReactMarkdown 组件包裹 AI 消息内容
- 代码块使用 rehype-pretty-code 渲染，添加复制按钮
- 流式消息末尾附加闪烁光标 `<span className="animate-pulse">▊</span>`

### Figma 导出
- 后端添加 API Route `/api/export-figma`
- 调用 code.to.design API（clip: true 模式）
- 前端触发后等待响应，将数据写入剪贴板，提示用户粘贴到 Figma
- 降级：提供"复制 HTML 源码"按钮

### 新增依赖
```
react-markdown remark-gfm rehype-pretty-code shiki
```

## Decision (ADR-lite)

**Context**: Figma REST API 不支持创建设计内容（只读），所有开源 npm 包需要 Figma 插件环境才能写入画布。
**Decision**: 采用 code.to.design API（Clipboard 模式）作为主要导出方案，用户选择"可编辑节点结构"。
**Consequences**: 依赖第三方商业服务（按 credit 付费），但用户体验最好（一键复制+粘贴）。降级方案为截图+HTML源码复制。

## Out of Scope

- Monaco Editor 替换 textarea 编辑器
- 多人协作/云同步
- 组件树拖拽排序
- 设置页完全重构（仅调整入口方式）

## Research References

- [`research/figma-export.md`](research/figma-export.md) — Figma 导出 5 种方案对比，推荐 code.to.design API
- [`research/markdown-rendering.md`](research/markdown-rendering.md) — Markdown 渲染方案对比，推荐 react-markdown + rehype-pretty-code

## Technical Notes

### 关键文件
- `src/app/page.tsx` — 主布局重构
- `src/stores/app-store.ts` — 状态调整
- `src/components/layout/sidebar.tsx` — 改造或移除
- `src/components/chat/message-bubble.tsx` — Markdown 渲染
- `src/components/canvas/design-canvas.tsx` — 右侧预览复用
- `src/components/canvas/canvas-editor-view.tsx` — 分隔条参考实现

### 已安装相关依赖
- `@monaco-editor/react@4.7.0`（未使用）
- `lucide-react`（图标）
- `shadcn/ui`（组件库）
