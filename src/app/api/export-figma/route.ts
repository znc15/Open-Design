import { NextRequest, NextResponse } from "next/server";

const API_ENDPOINT = "https://api.to.design/html";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html } = body as { html?: string };

    if (!html?.trim()) {
      return NextResponse.json(
        { error: "缺少 HTML 内容" },
        { status: 400 },
      );
    }

    const apiKey = process.env.TO_DESIGN_API_KEY;
    if (!apiKey) {
      // 无 API Key 时返回提示，前端走降级逻辑
      return NextResponse.json(
        { error: "未配置 TO_DESIGN_API_KEY", fallback: true },
        { status: 503 },
      );
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ html, clip: true }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("to.design API 错误:", response.status, text);
      return NextResponse.json(
        { error: `to.design API 返回 ${response.status}`, fallback: true },
        { status: 502 },
      );
    }

    // 响应体是 Figma 剪贴板格式（text/html）
    const clipboardData = await response.text();

    return new NextResponse(clipboardData, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Clipboard-Mode": "figma",
      },
    });
  } catch (error) {
    console.error("Figma 导出异常:", error);
    return NextResponse.json(
      { error: "导出服务异常", fallback: true },
      { status: 500 },
    );
  }
}
