# 代码复用思考指南

> 创建新组件或工具函数前，用这个清单自检。

---

## 复用检查清单

### 1. 搜索现有实现

- [ ] 在 `src/components/` 下搜索功能相似的组件
- [ ] 在 `src/stores/` 下搜索功能相似的 store/action
- [ ] 在 `src/lib/` 下搜索功能相似的工具函数
- [ ] 在 `src/services/` 下搜索功能相似的服务方法

### 2. 评估复用可行性

- [ ] 现有实现是否满足 80% 需求？
- [ ] 差异部分是否可以通过 props / 参数覆盖？
- [ ] 修改现有实现是否比新建更安全？

### 3. 决策

- **复用**：差异 < 20%，通过参数扩展
- **提取**：多处使用相同逻辑，提取到 `src/lib/` 或 `src/types/`
- **新建**：无相似实现，或差异 > 50%

---

## 本项目已知可复用模块

| 模块 | 路径 | 用途 |
|------|------|------|
| `cn()` | `src/lib/utils.ts` | Tailwind 类名合并 |
| `ModelAdapter` | `src/services/model-adapter.ts` | 模型适配器接口 |
| `ModelService` | `src/services/model-service.ts` | 模型服务单例 |
| `extractCodeFromMarkdown()` | `src/lib/prompts/system.ts` | Markdown 代码提取 |
| `tavilySearch()` | `src/lib/search/tavily.ts` | 联网搜索 |
| `ContentBlock` 类型 | `src/types/chat.ts` | 内容块联合类型 |
| `ModelConfig` 类型 | `src/types/chat.ts` | 模型配置接口 |

---

## 提取模式

当发现 2+ 处使用相同逻辑时：

1. 提取到 `src/lib/` 下的独立文件
2. 导出纯函数（不依赖 React hooks）
3. 在使用处通过 `@/lib/xxx` 导入
4. 更新此指南的可复用模块表

---

## 禁止模式

- 不要在多个组件中复制粘贴相同逻辑
- 不要在 store action 中重复相同的错误处理代码（提取为工具函数）
- 不要为一次性使用创建过度抽象的工具函数
