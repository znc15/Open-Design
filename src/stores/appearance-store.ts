import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_RADIUS = 0.5;

interface AppearanceState {
  /** 全局圆角基准值（rem） */
  borderRadius: number;
  setBorderRadius: (value: number) => void;
  resetBorderRadius: () => void;
}

/** 设置 CSS 变量 --radius 的辅助函数，仅在浏览器环境执行 */
function applyRadius(value: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--radius", `${value}rem`);
  }
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      borderRadius: DEFAULT_RADIUS,
      setBorderRadius: (value) => {
        applyRadius(value);
        set({ borderRadius: value });
      },
      resetBorderRadius: () => {
        applyRadius(DEFAULT_RADIUS);
        set({ borderRadius: DEFAULT_RADIUS });
      },
    }),
    {
      name: "open-design-appearance",
      partialize: (state) => ({ borderRadius: state.borderRadius }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyRadius(state.borderRadius);
        }
      },
    }
  )
);
