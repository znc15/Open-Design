# 数据库规范

> OpenDesign 当前不使用传统数据库，数据持久化依赖浏览器 localStorage。

---

## 当前持久化方案

| 数据 | 存储方式 | 机制 |
|------|----------|------|
| 对话消息 | localStorage | Zustand `persist` 中间件 |
| 模型配置 | localStorage | Zustand `persist` 中间件 |
| 画布状态 | localStorage | Zustand `persist` 中间件 |
| 项目文件 | localStorage | Zustand `persist` 中间件 |
| Skill 配置 | localStorage | Zustand `persist` 中间件 |
| API 密钥 | localStorage | Zustand `persist` 中间件 |

---

## localStorage Key 命名

所有 key 使用 `open-design-` 前缀：

```
open-design-app          # app-store
open-design-canvas       # canvas-store
open-design-chat         # chat-store
open-design-project      # project-store
open-design-skill        # skill-store
open-design-sidebar      # sidebar-store
open-design-todo         # todo-store
```

---

## 数据大小限制

- localStorage 单个域名上限约 5-10MB
- 对话消息可能快速增长，需要考虑：
  - 消息截断策略（只保留最近 N 条）
  - 大型内容块（图片 base64）不持久化
  - 未来迁移到 IndexedDB

---

## 未来迁移路径

当 localStorage 不再满足需求时，按以下优先级迁移：

1. **IndexedDB**：大容量客户端存储，适合对话历史
2. **OPFS (Origin Private File System)**：文件系统级存储，适合项目文件
3. **服务端数据库**：如需多设备同步，引入 SQLite / PostgreSQL

---

## 常见错误

- 不要在 `partialize` 中包含 base64 图片数据（会快速撑爆 localStorage）
- 不要假设 localStorage 始终可用（隐私模式下可能抛出异常）
- 不要在 store 外部直接操作 localStorage（必须通过 Zustand persist）
