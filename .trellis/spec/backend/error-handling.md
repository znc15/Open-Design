# 错误处理

> OpenDesign 错误处理约定。

---

## 错误分类

| 类别 | 示例 | 处理方式 |
|------|------|----------|
| **模型调用失败** | API Key 无效、网络超时、模型不存在 | toast 提示 + 保留对话上下文 |
| **流式解析错误** | SSE 格式异常、JSON 解析失败 | console.error + 终止流 + toast |
| **配置缺失** | API Key 未配置 | 降级处理（禁用功能）+ 设置面板引导 |
| **存储溢出** | localStorage 满 | 截断旧数据 + toast 警告 |
| **导出失败** | Figma API 错误 | toast 提示 + 保留编辑内容 |

---

## 错误传播模式

```
AsyncGenerator (适配器)
  → for await...of (chat-store)
    → try-catch 包裹
      → console.error (日志)
      → updateMessage (标记错误状态)
      → toast (用户提示)
```

---

## 适配器错误处理

```ts
// 适配器内部：抛出结构化错误
async *sendMessage(model, messages): AsyncGenerator<StreamChunk> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API 错误: ${response.status} ${response.statusText}`);
    }
    // 流式处理...
  } catch (error) {
    yield {
      type: "done",
    };
    throw error; // 向上传播
  }
}
```

---

## Store 错误处理

```ts
// chat-store 中捕获并展示
sendMessage: async (content) => {
  try {
    for await (const chunk of modelService.sendMessage(model, messages)) {
      // 处理 chunk...
    }
  } catch (error) {
    console.error("消息发送失败:", error);
    // 标记消息为错误状态
    updateMessage(id, [{
      type: "text",
      text: `发送失败: ${error instanceof Error ? error.message : "未知错误"}`,
    }]);
    toast({ title: "发送失败", description: "请检查模型配置" });
  }
}
```

---

## 用户提示规范

- 使用 `sonner` toast 库展示错误
- 错误消息必须包含：**发生了什么** + **用户该怎么做**
- 不要暴露技术细节（如堆栈跟踪）给用户

```tsx
// 正确
toast({ title: "模型调用失败", description: "请检查 API Key 和网络连接" });

// 错误
toast({ title: "Error", description: error.stack });
```

---

## 常见错误

- 不要吞掉错误（空 catch 块）
- 不要在流式处理中静默跳过异常 chunk
- 不要向用户暴露原始错误堆栈
- 不要在错误后忘记终止流式状态（`isStreaming` 必须重置为 `false`）
