# Frontend Development Guidelines

> OpenDesign 前端开发规范索引。

---

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19
- **样式**: Tailwind CSS 4 + shadcn/ui
- **状态管理**: Zustand 5 (persist middleware)
- **类型系统**: TypeScript 5 (strict mode)
- **代码编辑器**: Monaco Editor
- **拖拽**: dnd-kit
- **图标**: Lucide React

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | 目录组织、模块划分、命名约定 | ✅ 已填充 |
| [Component Guidelines](./component-guidelines.md) | 组件结构、Props 约定、样式模式 | ✅ 已填充 |
| [Hook Guidelines](./hook-guidelines.md) | 自定义 Hook、数据获取、Store 选择器 | ✅ 已填充 |
| [State Management](./state-management.md) | Zustand 架构、持久化、Store 间通信 | ✅ 已填充 |
| [Quality Guidelines](./quality-guidelines.md) | 禁止模式、必须模式、审查清单 | ✅ 已填充 |
| [Type Safety](./type-safety.md) | 类型组织、核心类型签名、禁止模式 | ✅ 已填充 |

---

## Quick Reference

### 组件模板

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSomeStore } from "@/stores/some-store";

export function MyComponent() {
  const value = useSomeStore((s) => s.value);
  const setValue = useSomeStore((s) => s.setValue);

  return <div className={cn("base-class", condition && "active")}>...</div>;
}
```

### Store 模板

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MyState {
  value: string;
  setValue: (value: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: "",
      setValue: (value) => set({ value }),
    }),
    { name: "open-design-my", partialize: (s) => ({ value: s.value }) }
  )
);
```

---

## 核心类型速查

- `Message`: 对话消息（id, role, content[], createdAt）
- `ContentBlock`: 内容块联合类型（text, image, tool_use, tool_result, search_result）
- `ModelConfig`: 模型配置（provider, baseUrl, apiKey, model, ...）
- `StreamChunk`: 流式响应块（type, text, id, ...）

详见 [Type Safety](./type-safety.md)。