# 质量规范

> OpenDesign 前端代码质量标准。

---

## 禁止模式

| 模式 | 原因 |
|------|------|
| `// @ts-ignore` / `// @ts-expect-error` | 隐藏类型错误 |
| `any` 类型 | 丧失类型安全 |
| 内联样式对象 `style={{...}}`（非必要） | 应使用 Tailwind 类名 |
| 组件内定义常量配置 | 提取到组件外部 |
| 直接修改 store state | 必须通过 setter |
| `useState` 存储派生值 | 使用 `useMemo` |
| 在 `useEffect` 中缺少依赖 | 导致闭包陷阱 |

---

## 必须模式

| 模式 | 说明 |
|------|------|
| `"use client"` | 使用 hooks/事件/浏览器 API 的组件必须标注 |
| `cn()` 合并类名 | 条件样式必须通过 `cn()` |
| Store 选择器 | `useStore((s) => s.field)` 而非 `useStore()` |
| `partialize` | persist store 必须指定持久化字段 |
| `aria-label` | 图标按钮和交互元素 |

---

## 测试要求

- 当前项目尚未配置测试框架
- 新增核心逻辑（store action、工具函数、适配器）应补充单元测试
- UI 组件暂不要求测试

---

## 代码审查清单

- [ ] 组件是否标注 `"use client"`（如需要）
- [ ] Store 是否正确使用选择器
- [ ] persist store 是否正确 `partialize`
- [ ] 条件样式是否使用 `cn()`
- [ ] 图标按钮是否有 `aria-label`
- [ ] 是否有遗留的 `console.log` / `console.warn`
- [ ] 导入路径是否使用 `@/` 别名
