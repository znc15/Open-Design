# Thinking Guides

> 编写代码前的思考清单。

---

## 为什么需要思考指南？

**大多数 bug 来自"没想到这一点"**，而非技术能力不足。

这些指南帮助你在编码前提出正确的问题。

---

## Available Guides

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md) | 搜索现有实现，避免重复 | 创建新组件/工具函数前 |
| [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md) | 检查跨层数据流和类型传递 | 修改涉及 store/services/API 的功能 |

---

## Quick Reference: Thinking Triggers

### 何时思考跨层问题

- 功能涉及 3+ 层（组件 → Store → 服务 → API）
- 数据格式在层边界发生变化
- 流式响应需要正确累加和错误处理

→ 阅读 [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md)

### 何时思考代码复用

- 创建新组件或工具函数
- 发现相似逻辑在多处使用
- 修改常量或配置值

→ 阅读 [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md)

---

## Pre-Modification Rule (CRITICAL)

> **修改任何值之前，先搜索！**

```bash
grep -r "value_to_change" src/
```

这个习惯能防止大多数"忘记更新某处"的 bug。

---

## Core Principle

30 分钟思考 = 3 小时调试节省。