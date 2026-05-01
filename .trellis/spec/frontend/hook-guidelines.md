# Hook 规范

> OpenDesign 前端 Hook 使用约定。

---

## 自定义 Hook 模式

当前项目尚未建立 `hooks/` 目录，但遵循以下模式：

- Hook 文件放在 `src/hooks/` 下，命名为 `use-xxx.ts`
- 导出命名为 `useXxx`
- 返回值使用具名返回，不用数组（除非类似 `useState` 语义）

```tsx
// src/hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

---

## 数据获取

- 使用 **Zustand store** 管理服务端数据（当前模式）
- `@tanstack/react-query` 已安装但尚未广泛使用
- 流式数据通过 `AsyncGenerator` + `for await...of` 处理

```tsx
// 流式数据获取模式（chat-store 中的实际用法）
for await (const chunk of modelService.sendMessage(model, messages)) {
  if (chunk.type === "text" && chunk.text) {
    accumulatedText += chunk.text;
    updateMessage(id, [{ type: "text", text: accumulatedText }]);
  } else if (chunk.type === "done") {
    break;
  }
}
```

---

## 命名约定

| 类型 | 命名 | 示例 |
|------|------|------|
| 自定义 Hook | `use` + PascalCase | `useDebounce`, `useElementSelection` |
| Hook 文件 | kebab-case | `use-debounce.ts` |
| Store Hook | `use` + 域名 + `Store` | `useCanvasStore`, `useChatStore` |

---

## Store 选择器模式

使用 Zustand 选择器避免不必要的重渲染：

```tsx
// 正确：只订阅需要的字段
const zoom = useCanvasStore((s) => s.zoom);
const setZoom = useCanvasStore((s) => s.setZoom);

// 错误：订阅整个 store
const store = useCanvasStore();
```

---

## 常见错误

- 不要在 `useEffect` 中做条件性 hook 调用
- 不要忘记 `useCallback` / `useMemo` 的依赖数组
- 流式数据更新时使用累加模式，不要覆盖之前的内容
