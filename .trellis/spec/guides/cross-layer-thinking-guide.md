# 跨层思考指南

> 修改涉及多个层的代码前，用这个清单自检。

---

## 层级架构

```
UI 组件 (components/)
  ↕ 双向绑定
Zustand Store (stores/)
  ↕ 调用
服务层 (services/)
  ↕ HTTP / WebSocket
外部 API (OpenAI / Ollama / Tavily)
```

---

## 读流检查（数据从外到内）

- [ ] API 响应 → StreamChunk 类型是否正确映射？
- [ ] StreamChunk → ContentBlock 转换是否完整？
- [ ] ContentBlock → UI 渲染是否覆盖所有 type？
- [ ] 错误响应是否传播到 UI（toast / 消息状态）？

## 写流检查（数据从内到外）

- [ ] UI 输入 → store action 参数是否类型安全？
- [ ] Store action → 服务层调用是否传入正确配置？
- [ ] 服务层 → API 请求是否包含必要字段（model, messages, apiKey）？
- [ ] 流式响应是否正确累加（不覆盖之前内容）？

---

## 类型传递检查

- [ ] 跨层传递的数据是否有共享类型定义（`src/types/`）？
- [ ] 是否有隐式 `any` 在层边界？
- [ ] 枚举值是否跨层一致（如 `ContentBlockType`）？

---

## 错误传播检查

- [ ] 外部 API 错误是否映射到用户可理解的提示？
- [ ] 流式错误是否终止循环并重置 `isStreaming`？
- [ ] 网络断开时是否有降级行为？

---

## 本项目特殊点

- **模型适配器运行在客户端**：没有服务端代理，API Key 存储在浏览器
- **流式响应是核心路径**：所有模型交互都通过 `AsyncGenerator`
- **Store 间有跨域读取**：`chat-store` 读取 `canvas-store` 和 `app-store`
