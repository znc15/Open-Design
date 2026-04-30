import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  /** 左侧对话面板是否折叠 */
  chatPanelOpen: boolean;
  /** 主分栏拖拽中 */
  isDraggingMainSplit: boolean;
  /** 设置弹窗是否打开 */
  settingsOpen: boolean;
  /** Tavily API Key（联网搜索） */
  tavilyApiKey: string;
  /** Tavily API 自定义地址 */
  tavilyApiUrl: string;
  /** 是否自动发送选中元素到对话 */
  autoSendElement: boolean;

  setChatPanelOpen: (open: boolean) => void;
  toggleChatPanel: () => void;
  setDraggingMainSplit: (dragging: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTavilyApiKey: (key: string) => void;
  setTavilyApiUrl: (url: string) => void;
  setAutoSendElement: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      chatPanelOpen: true,
      isDraggingMainSplit: false,
      settingsOpen: false,
      tavilyApiKey: "",
      tavilyApiUrl: "https://api.tavily.com",
      autoSendElement: true,

      setChatPanelOpen: (open) => set({ chatPanelOpen: open }),

      toggleChatPanel: () =>
        set((state) => ({ chatPanelOpen: !state.chatPanelOpen })),

      setDraggingMainSplit: (dragging) =>
        set({ isDraggingMainSplit: dragging }),

      setSettingsOpen: (open) => set({ settingsOpen: open }),

      setTavilyApiKey: (key) => set({ tavilyApiKey: key }),
      setTavilyApiUrl: (url) => set({ tavilyApiUrl: url }),
      setAutoSendElement: (enabled) => set({ autoSendElement: enabled }),
    }),
    {
      name: "open-design-app",
      partialize: (state) => ({
        tavilyApiKey: state.tavilyApiKey,
        tavilyApiUrl: state.tavilyApiUrl,
        autoSendElement: state.autoSendElement,
      }),
    }
  )
);
