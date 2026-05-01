# 质量规范

> OpenDesign 后端/服务层代码质量标准。

---

## 禁止模式

| 模式 | 原因 |
|------|------|
| 空 catch 块 | 吞掉错误，无法排查 |
| 硬编码 API URL | 应使用 ModelConfig.baseUrl |
| 明文存储 API Key | 应通过 Zustand persist 加密存储 |
| 同步阻塞操作 | 浏览器环境必须异步 |
| 未处理的 Promise rejection | 导致静默失败 |

---

## 必须模式

| 模式 | 说明 |
|------|------|
| try-catch 包裹异步操作 | 所有模型调用、网络请求 |
| 错误日志 + 用户提示 | console.error + toast |
| 流式响应使用 AsyncGenerator | `async *sendMessage()` |
| 类型安全的配置 | ModelConfig 接口约束 |

---

## API Route 规范

```ts
// route.ts 标准模式
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 验证输入
    if (!body.required) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }
    // 处理逻辑
    const result = await processRequest(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API 错误:", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}
```

---

## 服务层规范

- 适配器必须实现 `ModelAdapter` 接口
- `ModelService` 是单例，通过 `getModelService()` 获取
- 流式方法返回 `AsyncGenerator<StreamChunk>`
- 非流式方法返回 `Promise<T>`

---

## 测试要求

- 当前项目尚未配置后端测试
- API Route 应补充集成测试
- 适配器应补充单元测试（mock fetch）

---

## 代码审查清单

- [ ] 异步操作是否包裹 try-catch
- [ ] API Route 是否验证输入
- [ ] 错误是否正确传播到调用方
- [ ] 是否有遗留的 console.log
- [ ] 配置是否通过 ModelConfig 传入
