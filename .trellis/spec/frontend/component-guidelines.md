# 组件规范

> OpenDesign 前端组件编写约定。

---

## 组件结构

```tsx
"use client";  // 客户端组件必须标注

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { SomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSomeStore } from "@/stores/some-store";

// 常量配置放在组件外部
const CONFIG = { ... };

export function MyComponent() {
  // 1. store 读取
  const value = useSomeStore((s) => s.value);
  const setValue = useSomeStore((s) => s.setValue);

  // 2. refs
  const ref = useRef<HTMLDivElement>(null);

  // 3. 本地 state
  const [local, setLocal] = useState(false);

  // 4. 派生值
  const derived = useMemo(() => ..., [deps]);

  // 5. 回调
  const handler = useCallback(() => ..., [deps]);

  // 6. effects
  useEffect(() => ..., [deps]);

  // 7. render
  return <div>...</div>;
}
```

---

## Props 约定

- 使用 TypeScript interface 定义 props，放在组件文件内
- 回调 props 以 `on` 开头：`onClick`, `onChange`, `onSelect`
- 可选 props 标注 `?`，提供默认值
- 不使用 `React.FC`，直接声明函数组件

```tsx
interface MyComponentProps {
  /** 必填 */
  title: string;
  /** 可选，有默认值 */
  variant?: "default" | "compact";
  /** 回调 */
  onSelect?: (id: string) => void;
}
```

---

## 样式模式

- 使用 **Tailwind CSS** 类名，通过 `cn()` 合并
- 条件样式用 `cn("base-class", condition && "active-class")`
- 不使用 CSS Modules 或 styled-components
- shadcn/ui 组件通过 `className` prop 扩展样式

```tsx
<div className={cn(
  "rounded-lg border bg-white shadow-sm",
  isActive && "border-primary bg-primary/5"
)} />
```

---

## 可访问性

- 交互元素必须提供 `aria-label` 或可见文本
- 图标按钮必须加 `aria-label` 和 `title`
- 使用语义化 HTML（`<nav>`, `<main>`, `<section>`）

---

## 常见错误

- 不要在组件内定义常量配置（提取到组件外部）
- 不要忘记 `"use client"` 指令（使用 hooks/事件/浏览器的组件）
- 不要直接修改 store state，必须通过 setter
