# 研究：React 聊天消息 Markdown 渲染 + 代码高亮 + 流式输出

- **日期**: 2026-04-29
- **场景**: Next.js 16 + React 19 + Tailwind CSS 4 的 AI 对话应用

---

## 推荐方案：react-markdown + rehype-pretty-code (Shiki)

### 依赖包

```bash
pnpm add react-markdown remark-gfm rehype-pretty-code shiki
```

### 组件设计

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'

// 流式消息用 cursor 动画
<span className="animate-pulse">▊</span>
```

### 方案对比

| 维度 | react-markdown + rehype-pretty-code | @chatscope/chat-ui-kit | 自定义解析 |
|---|---|---|---|
| Markdown 支持 | 完整（GFM） | 基础 | 按需实现 |
| 代码高亮 | Shiki（VSCode 级） | 无内置 | 需集成 |
| React 19 兼容 | 是 | 未知 | 是 |
| 流式支持 | 天然支持（逐段渲染） | 需适配 | 需实现 |
| 包大小 | ~30KB gzip | ~50KB gzip | 0 |
| 维护状态 | 活跃 | 低活跃 | N/A |

### 流式输出动画

- 使用 CSS `@keyframes blink` 实现光标闪烁
- 消息更新时平滑滚动到底部（`scrollIntoView({ behavior: 'smooth' })`）
- 流式过程中显示闪烁光标，完成后移除

### Tailwind CSS 4 兼容

- 使用 `@tailwindcss/typography` 插件为 Markdown 内容提供排版样式
- 代码块使用 Shiki 内联样式（不依赖 Tailwind）
