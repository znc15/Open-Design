import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 画布中的设计组件 */
export interface DesignComponent {
  id: string;
  type: "div" | "text" | "image" | "button" | "input" | "container";
  tagName: string;
  content: string;
  styles: Record<string, string>;
  children: DesignComponent[];
  parentId: string | null;
}

/** 预览设备类型 */
export type PreviewDevice = "desktop" | "tablet" | "mobile";

/** 预览设备尺寸 */
export const DEVICE_SIZES: Record<PreviewDevice, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: "桌面" },
  tablet: { width: 768, height: 1024, label: "平板" },
  mobile: { width: 375, height: 812, label: "手机" },
};

/** 分屏方向 */
export type SplitDirection = "horizontal" | "vertical";

/** 选中元素信息 */
export interface SelectedElementInfo {
  /** 元素标签名 */
  tagName: string;
  /** 元素 ID（如果有） */
  id: string | null;
  /** 元素 class 列表 */
  className: string;
  /** 元素文本内容（截断） */
  textContent: string;
  /** 元素在 DOM 中的路径 */
  path: string;
  /** 元素的内联样式 */
  style: string;
}

interface CanvasState {
  /** 设计组件树 */
  components: DesignComponent[];
  /** 当前选中的组件 ID */
  selectedId: string | null;
  /** 悬停的组件 ID */
  hoveredId: string | null;
  /** 预览设备 */
  previewDevice: PreviewDevice;
  /** 画布缩放比例 */
  zoom: number;
  /** 分屏方向 */
  splitDirection: SplitDirection;
  /** 分屏比例（0-1，左侧/上方占比） */
  splitRatio: number;
  /** 编辑器代码内容 */
  editorCode: string;
  /** 编辑器语言 */
  editorLanguage: "html" | "css" | "javascript";
  /** 是否正在拖拽分屏分隔线 */
  isDraggingSplit: boolean;
  /** 选中元素信息（用于画布元素选中） */
  selectedElementInfo: SelectedElementInfo | null;

  // 操作
  setSelectedId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setZoom: (zoom: number) => void;
  setSplitDirection: (direction: SplitDirection) => void;
  setSplitRatio: (ratio: number) => void;
  setEditorCode: (code: string) => void;
  setEditorLanguage: (lang: CanvasState["editorLanguage"]) => void;
  setIsDraggingSplit: (dragging: boolean) => void;
  setSelectedElementInfo: (info: SelectedElementInfo | null) => void;
  addComponent: (component: DesignComponent, parentId?: string | null) => void;
  updateComponent: (id: string, updates: Partial<DesignComponent>) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, newParentId: string | null, index: number) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      components: [],
      selectedId: null,
      hoveredId: null,
      previewDevice: "desktop",
      zoom: 1,
      splitDirection: "horizontal",
      splitRatio: 0.5,
      editorCode: "",
      editorLanguage: "html",
      isDraggingSplit: false,
      selectedElementInfo: null,

      setSelectedId: (id) => set({ selectedId: id }),
      setHoveredId: (id) => set({ hoveredId: id }),
      setPreviewDevice: (device) => set({ previewDevice: device }),
      setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
      setSplitDirection: (direction) => set({ splitDirection: direction }),
      setSplitRatio: (ratio) => set({ splitRatio: Math.max(0.1, Math.min(0.9, ratio)) }),
      setEditorCode: (code) => set({ editorCode: code }),
      setEditorLanguage: (lang) => set({ editorLanguage: lang }),
      setIsDraggingSplit: (dragging) => set({ isDraggingSplit: dragging }),
      setSelectedElementInfo: (info) => set({ selectedElementInfo: info }),

      addComponent: (component, parentId = null) =>
        set((state) => {
          const newComp = { ...component, parentId };
          if (parentId === null) {
            return { components: [...state.components, newComp] };
          }
          return {
            components: addToParent(state.components, parentId, newComp),
          };
        }),

      updateComponent: (id, updates) =>
        set((state) => ({
          components: updateInTree(state.components, id, updates),
        })),

      removeComponent: (id) =>
        set((state) => ({
          components: removeFromTree(state.components, id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      moveComponent: (id, newParentId, _index) =>
        set((state) => {
          const comp = findById(state.components, id);
          if (!comp) return state;
          const without = removeFromTree(state.components, id);
          const moved = { ...comp, parentId: newParentId };
          if (newParentId === null) {
            return { components: [...without, moved] };
          }
          return { components: addToParent(without, newParentId, moved) };
        }),
    }),
    {
      name: "open-design-canvas",
      partialize: (state) => ({
        components: state.components,
        previewDevice: state.previewDevice,
        zoom: state.zoom,
        splitDirection: state.splitDirection,
        splitRatio: state.splitRatio,
        editorCode: state.editorCode,
        editorLanguage: state.editorLanguage,
      }),
    }
  )
);

/** 在组件树中递归添加子组件 */
function addToParent(
  tree: DesignComponent[],
  parentId: string,
  component: DesignComponent
): DesignComponent[] {
  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, component] };
    }
    return { ...node, children: addToParent(node.children, parentId, component) };
  });
}

/** 在组件树中递归更新组件 */
function updateInTree(
  tree: DesignComponent[],
  id: string,
  updates: Partial<DesignComponent>
): DesignComponent[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    return { ...node, children: updateInTree(node.children, id, updates) };
  });
}

/** 从组件树中递归移除组件 */
function removeFromTree(tree: DesignComponent[], id: string): DesignComponent[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: removeFromTree(node.children, id),
    }));
}

/** 在组件树中按 ID 查找组件 */
function findById(tree: DesignComponent[], id: string): DesignComponent | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findById(node.children, id);
    if (found) return found;
  }
  return null;
}
