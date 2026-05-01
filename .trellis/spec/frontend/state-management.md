# 状态管理

> OpenDesign 使用 Zustand 管理全局状态。

---

## 状态分类

| 类别 | 方案 | 示例 |
|------|------|------|
| **全局 UI 状态** | Zustand + persist | 面板开关、设置项 |
| **领域状态** | Zustand + persist | 对话列表、画布组件树、项目文件 |
| **临时 UI 状态** | React `useState` | 拖拽中、全屏、本地表单 |
| **派生状态** | 组件内 `useMemo` | 设备尺寸、格式化文本 |

---

## Store 架构

```
stores/
├── app-store.ts      # 全局 UI：面板折叠、设置开关、Tavily 配置
├── canvas-store.ts   # 画布：组件树、选中元素、预览设备、缩放、编辑器代码
├── chat-store.ts     # 对话：消息列表、流式状态、模型配置、联网搜索
├── project-store.ts  # 项目：项目列表、文件管理
├── skill-store.ts    # Skill：技能列表、激活状态、system prompt
├── sidebar-store.ts  # 侧边栏：折叠状态
└── todo-store.ts     # 待办：任务列表
```

---

## Store 编写模式

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MyState {
  // 状态字段
  value: string;
  // 操作方法
  setValue: (value: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: "",
      setValue: (value) => set({ value }),
    }),
    {
      name: "open-design-my",       // localStorage key
      partialize: (state) => ({     // 只持久化需要的数据
        value: state.value,
      }),
    }
  )
);
```

---

## 持久化规则

- 所有 store 使用 `persist` 中间件
- `name` 前缀统一为 `open-design-`
- `partialize` 只持久化业务数据，排除 UI 临时状态（如 `isDragging`、`isStreaming`）
- 方法函数不持久化

---

## Store 间通信

- 允许在 action 中读取其他 store：`useOtherStore.getState()`
- 不允许在 action 外部建立 store 间订阅（避免循环依赖）
- 示例：`chat-store` 在 `sendMessage` 中读取 `canvas-store` 和 `app-store`

```tsx
// 正确：在 action 内部跨 store 读取
sendMessage: async (content) => {
  const apiKey = useAppStore.getState().tavilyApiKey;
  useCanvasStore.getState().setEditorCode(code);
}
```

---

## 何时使用全局状态 vs 本地状态

- **全局**：跨组件共享、需要持久化、影响多个功能域
- **本地**：仅当前组件使用、不需要持久化、纯 UI 交互（如拖拽中状态）

---

## 常见错误

- 不要在 `partialize` 中包含方法或临时 UI 状态
- 不要在 store 外部直接订阅整个 store（使用选择器）
- 不要在多个 store 中重复定义相同的状态字段
