import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 侧边栏状态管理
 * 管理侧边栏的展开/折叠、宽度、当前选中的 tab
 */
interface SidebarState {
  /** 侧边栏是否展开 */
  isOpen: boolean;
  /** 侧边栏宽度（像素） */
  width: number;
  /** 当前选中的 tab：conversations（对话历史）或 projects（项目列表） */
  activeTab: "conversations" | "projects";
  /** 对话历史搜索关键词 */
  searchQuery: string;

  /** 切换侧边栏展开/折叠 */
  toggle: () => void;
  /** 设置侧边栏展开状态 */
  setOpen: (open: boolean) => void;
  /** 设置侧边栏宽度 */
  setWidth: (width: number) => void;
  /** 切换当前 tab */
  setTab: (tab: "conversations" | "projects") => void;
  /** 设置搜索关键词 */
  setSearchQuery: (query: string) => void;
}

/** 侧边栏最小/最大宽度 */
export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 400;
export const SIDEBAR_DEFAULT_WIDTH = 260;
/** 折叠态宽度 */
export const SIDEBAR_COLLAPSED_WIDTH = 48;

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      width: SIDEBAR_DEFAULT_WIDTH,
      activeTab: "conversations",
      searchQuery: "",

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
      setWidth: (width) =>
        set({
          width: Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width)),
        }),
      setTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "open-design-sidebar",
      partialize: (state) => ({
        isOpen: state.isOpen,
        width: state.width,
        activeTab: state.activeTab,
      }),
    }
  )
);
