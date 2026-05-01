# 日志规范

> OpenDesign 日志记录约定。

---

## 当前日志方案

项目运行在浏览器环境，日志输出到浏览器控制台。

---

## 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| `console.error` | 不可恢复的错误 | 模型 API 调用失败、流式解析异常 |
| `console.warn` | 可恢复的异常 | 配置缺失使用默认值、功能降级 |
| `console.log` | 开发调试 | 流式 chunk 接收、状态变更（仅开发环境） |
| `console.info` | 关键业务事件 | 不使用 |

---

## 日志格式

```ts
// 错误日志：包含上下文
console.error("模型调用失败:", { model: config.name, error: error.message });

// 警告日志：说明降级行为
console.warn("Tavily API Key 未配置，联网搜索已禁用");

// 调试日志：仅开发环境
if (process.env.NODE_ENV === "development") {
  console.log("流式响应 chunk:", chunk.type, chunk.text?.slice(0, 50));
}
```

---

## 禁止模式

| 模式 | 原因 |
|------|------|
| 生产环境 `console.log` | 暴露内部状态，影响性能 |
| 日志中包含完整 API Key | 安全风险 |
| 日志中包含完整 base64 图片 | 控制台爆炸 |
| 空 catch 块 | 吞掉错误，无法排查 |

---

## 错误处理日志模式

```ts
try {
  await someOperation();
} catch (error) {
  console.error("操作失败:", { context: "描述", error: error instanceof Error ? error.message : String(error) });
  // 向用户展示友好提示
  toast({ title: "操作失败", description: "请稍后重试" });
}
```
