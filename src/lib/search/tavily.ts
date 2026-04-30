/**
 * 联网搜索服务
 * 通过 Tavily API 实现联网搜索
 */

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  /** 搜索耗时（毫秒） */
  duration: number;
}

const TAVILY_API_URL = "https://api.tavily.com/search";

/**
 * 执行联网搜索
 * @param query 搜索关键词
 * @param apiKey Tavily API Key
 * @param maxResults 最大结果数
 */
export async function searchWeb(
  query: string,
  apiKey: string,
  maxResults: number = 5
): Promise<SearchResponse> {
  if (!apiKey) {
    throw new Error("Tavily API Key 未配置");
  }

  if (!query.trim()) {
    throw new Error("搜索关键词不能为空");
  }

  const startTime = Date.now();

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: query.trim(),
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "未知错误");
    throw new Error(`Tavily API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const duration = Date.now() - startTime;

  const results: SearchResult[] = (data.results || []).map(
    (r: { title?: string; url?: string; content?: string; score?: number }) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.content || "",
      score: r.score || 0,
    })
  );

  return {
    query: data.query || query,
    results,
    duration,
  };
}

/**
 * 将搜索结果格式化为可注入对话的文本
 */
export function formatSearchResultsForContext(response: SearchResponse): string {
  if (response.results.length === 0) {
    return `搜索 "${response.query}" 未找到相关结果。`;
  }

  const formatted = response.results
    .map((r, i) => {
      const content = r.content.length > 300 ? r.content.slice(0, 300) + "…" : r.content;
      return `[${i + 1}] ${r.title}\n来源: ${r.url}\n${content}`;
    })
    .join("\n\n");

  return `以下是关于 "${response.query}" 的搜索结果：\n\n${formatted}`;
}
