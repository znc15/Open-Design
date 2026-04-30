import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, ModelConfig, StreamChunk, Conversation } from "@/types/chat";
import { modelService } from "@/services";
import { useCanvasStore } from "./canvas-store";
import { useSkillStore } from "./skill-store";
import { useAppStore } from "./app-store";
import { useProjectStore } from "./project-store";

interface ChatState {
  /** 所有对话 */
  conversations: Conversation[];
  /** 当前激活的对话 ID */
  activeConversationId: string | null;
  isStreaming: boolean;
  activeModel: ModelConfig | null;
  savedModels: ModelConfig[];
  /** 联网搜索是否开启 */
  searchEnabled: boolean;

  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: Message["content"]) => void;
  setStreaming: (streaming: boolean) => void;
  setActiveModel: (model: ModelConfig) => void;
  clearMessages: () => void;
  addSavedModel: (model: ModelConfig) => void;
  removeSavedModel: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  abortStream: () => void;
  /** 设置联网搜索开关 */
  setSearchEnabled: (enabled: boolean) => void;

  /** 新建对话 */
  createConversation: () => string;
  /** 切换对话 */
  switchConversation: (id: string) => void;
  /** 删除对话 */
  deleteConversation: (id: string) => void;
  /** 重命名对话 */
  renameConversation: (id: string, title: string) => void;
  /** 清空所有对话历史 */
  clearAllConversations: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 从 Markdown 回复中提取第一个 HTML 代码块 */
function extractCodeFromMarkdown(text: string): string | null {
  const htmlMatch = text.match(/```(?:html|htm)\s*\n([\s\S]*?)```/);
  if (htmlMatch) return htmlMatch[1].trim();

  const anyMatch = text.match(/```\w*\s*\n([\s\S]*?)```/);
  if (anyMatch) {
    const code = anyMatch[1].trim();
    if (code.includes("<") && code.includes(">")) return code;
  }

  return null;
}

/** 从消息列表中自动生成对话标题（取第一条用户消息的前 20 个字符） */
function generateTitle(content: string): string {
  const text = content.trim().replace(/\n/g, " ");
  return text.length > 20 ? text.slice(0, 20) + "…" : text;
}

/** 获取当前对话 */
function getActiveConversation(
  conversations: Conversation[],
  activeId: string | null
): Conversation | undefined {
  return conversations.find((c) => c.id === activeId);
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      activeModel: null,
      savedModels: [],
      searchEnabled: false,

      addMessage: (message) =>
        set((state) => {
          const conv = getActiveConversation(state.conversations, state.activeConversationId);
          if (!conv) return state;
          return {
            conversations: state.conversations.map((c) =>
              c.id === conv.id
                ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
                : c
            ),
          };
        }),

      updateMessage: (id, content) =>
        set((state) => {
          const conv = getActiveConversation(state.conversations, state.activeConversationId);
          if (!conv) return state;
          return {
            conversations: state.conversations.map((c) =>
              c.id === conv.id
                ? {
                    ...c,
                    messages: c.messages.map((msg) =>
                      msg.id === id ? { ...msg, content } : msg
                    ),
                    updatedAt: Date.now(),
                  }
                : c
            ),
          };
        }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      setActiveModel: (model) => set({ activeModel: model }),

      clearMessages: () =>
        set((state) => {
          const conv = getActiveConversation(state.conversations, state.activeConversationId);
          if (!conv) return state;
          return {
            conversations: state.conversations.map((c) =>
              c.id === conv.id ? { ...c, messages: [], updatedAt: Date.now() } : c
            ),
          };
        }),

      addSavedModel: (model) =>
        set((state) => ({
          savedModels: [...state.savedModels.filter((m) => m.id !== model.id), model],
        })),

      removeSavedModel: (id) =>
        set((state) => ({
          savedModels: state.savedModels.filter((m) => m.id !== id),
        })),

      createConversation: () => {
        const id = `conv-${generateId()}`;
        const now = Date.now();
        const newConv: Conversation = {
          id,
          title: "新对话",
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      switchConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) =>
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          const newActiveId =
            state.activeConversationId === id
              ? remaining.length > 0
                ? remaining[0].id
                : null
              : state.activeConversationId;
          return {
            conversations: remaining,
            activeConversationId: newActiveId,
          };
        }),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        })),

      clearAllConversations: () =>
        set({ conversations: [], activeConversationId: null }),

      setSearchEnabled: (enabled) => set({ searchEnabled: enabled }),

      sendMessage: async (content: string) => {
        const { activeModel, activeConversationId, conversations, addMessage, setStreaming, updateMessage, createConversation, searchEnabled } = get();
        if (!activeModel || !content.trim()) return;

        // 自动创建项目（如果没有活跃项目）
        const projectStore = useProjectStore.getState();
        let activeProject = projectStore.getActiveProject();
        if (!activeProject) {
          const projectName = generateTitle(content);
          projectStore.createProject(projectName, "vanilla");
          activeProject = projectStore.getActiveProject();
        }

        // 如果没有活跃对话，自动创建
        let convId = activeConversationId;
        if (!convId || !getActiveConversation(conversations, convId)) {
          convId = createConversation();
        }

        // 关联对话到当前项目
        if (activeProject && convId) {
          projectStore.linkConversation(activeProject.id, convId);
        }

        // 添加用户消息
        const userMessage: Message = {
          id: `msg-${generateId()}`,
          role: "user",
          content: [{ type: "text", text: content.trim() }],
          createdAt: Date.now(),
        };
        addMessage(userMessage);

        // 首次发送时自动设置对话标题
        const conv = getActiveConversation(get().conversations, convId);
        if (conv && conv.title === "新对话") {
          get().renameConversation(convId, generateTitle(content));
        }

        // 创建助手消息占位
        const assistantId = `msg-${generateId()}`;
        const assistantMessage: Message = {
          id: assistantId,
          role: "assistant",
          content: [{ type: "text", text: "" }],
          createdAt: Date.now(),
        };
        addMessage(assistantMessage);

        setStreaming(true);

        try {
          const currentConv = getActiveConversation(get().conversations, convId)!;
          const allMessages = currentConv.messages
            .filter((m) => m.id !== assistantId)
            .slice(0, -1); // 排除刚添加的 assistant 占位

          // 构建发送给 API 的消息列表
          const messagesForApi: Array<{ role: string; content: string }> = [];

          // 注入 Skill system prompt
          const skillState = useSkillStore.getState();
          if (skillState.activeSkillId) {
            const systemPrompt = skillState.getResolvedSystemPrompt(skillState.activeSkillId);
            if (systemPrompt) {
              messagesForApi.push({ role: "system", content: systemPrompt });
            }
          }

          // 联网搜索：如果开启，先搜索并将结果注入上下文
          if (searchEnabled) {
            try {
              const { searchWeb, formatSearchResultsForContext } = await import("@/lib/search");
              // 从用户消息中提取搜索关键词（简单实现：直接用用户消息作为搜索词）
              const searchQuery = content.trim().slice(0, 100);
              // 优先从 store 读取 Tavily API Key，其次使用环境变量
              const apiKey = useAppStore.getState().tavilyApiKey || process.env.NEXT_PUBLIC_TAVILY_API_KEY || "";
              if (apiKey) {
                const searchResponse = await searchWeb(searchQuery, apiKey, 3);
                const searchContext = formatSearchResultsForContext(searchResponse);

                // 将搜索结果作为系统消息注入
                messagesForApi.push({
                  role: "system",
                  content: `以下是联网搜索的结果，请参考这些信息回答用户的问题：\n\n${searchContext}`,
                });

                // 在助手消息中添加搜索结果标记
                updateMessage(assistantId, [
                  { type: "search_result", searchResults: searchResponse.results },
                  { type: "text", text: "" },
                ]);
              }
            } catch (searchError) {
              // 搜索失败不阻塞对话，静默跳过
              console.warn("联网搜索失败:", searchError);
            }
          }

          // 添加历史消息
          for (const msg of allMessages) {
            const textContent = msg.content
              .filter((b) => b.type === "text")
              .map((b) => b.text || "")
              .join("\n");
            if (textContent) {
              messagesForApi.push({ role: msg.role, content: textContent });
            }
          }

          // 添加当前用户消息
          messagesForApi.push({ role: "user", content: content.trim() });

          let accumulatedText = "";

          for await (const chunk of modelService.sendMessage(activeModel, messagesForApi)) {
            if (chunk.type === "text" && chunk.text) {
              accumulatedText += chunk.text;
              updateMessage(assistantId, [{ type: "text", text: accumulatedText }]);
            } else if (chunk.type === "done") {
              break;
            }
          }

          // 流式结束后，从回复中提取代码并自动应用到画布预览和项目文件
          const extractedCode = extractCodeFromMarkdown(accumulatedText);
          if (extractedCode) {
            useCanvasStore.getState().setEditorCode(extractedCode);

            // 同步代码到项目文件，使 Monaco 编辑器也能显示
            const projectStore = useProjectStore.getState();
            const activeProject = projectStore.getActiveProject();
            if (activeProject) {
              const htmlFile = activeProject.files.find(
                (f) => f.language === "html" || f.name === "index.html"
              );
              if (htmlFile) {
                projectStore.updateFile(activeProject.id, htmlFile.id, extractedCode);
              } else {
                // 项目中没有 HTML 文件，自动创建一个
                projectStore.addFile(activeProject.id, {
                  name: "index.html",
                  language: "html",
                  content: extractedCode,
                });
              }
            } else {
              // 没有活跃项目，自动创建一个并填入代码
              const projectId = projectStore.createProject("AI 设计", "vanilla");
              const project = useProjectStore.getState().getActiveProject();
              if (project) {
                const htmlFile = project.files.find(
                  (f) => f.language === "html" || f.name === "index.html"
                );
                if (htmlFile) {
                  projectStore.updateFile(project.id, htmlFile.id, extractedCode);
                }
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "发生未知错误";
          updateMessage(assistantId, [{ type: "text", text: `错误: ${errorMessage}` }]);
        } finally {
          setStreaming(false);
        }
      },

      abortStream: () => {
        modelService.abort();
        set({ isStreaming: false });
      },
    }),
    {
      name: "open-design-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        activeModel: state.activeModel,
        savedModels: state.savedModels,
        searchEnabled: state.searchEnabled,
      }),
    }
  )
);
