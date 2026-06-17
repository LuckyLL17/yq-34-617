import { create } from 'zustand';
import type { DrawingPath, DrawingConfig, PageDrawingPaths } from '@/types';

/**
 * 绘图 Store
 * 职责：管理绘图相关的状态和操作，包括画笔配置、路径管理、撤销重做等
 */

interface DrawingState extends DrawingConfig {
  /** 各页面的绘制路径 */
  pagePaths: PageDrawingPaths;
  /** 各页面的重做栈 */
  pageRedoStack: PageDrawingPaths;

  /** 设置画笔颜色 */
  setPenColor: (color: string) => void;
  /** 设置画笔宽度 */
  setPenWidth: (width: number) => void;
  /** 设置绘图是否启用 */
  setDrawingEnabled: (enabled: boolean) => void;
  /** 向指定页面添加绘制路径 */
  addPathToPage: (pageIndex: number, path: DrawingPath) => void;
  /** 撤销指定页面的上一步绘制 */
  undoPath: (pageIndex: number) => void;
  /** 重做指定页面的下一步绘制 */
  redoPath: (pageIndex: number) => void;
  /** 清空所有页面的绘制路径 */
  clearAllPaths: () => void;
  /** 清空指定页面的绘制路径 */
  clearPagePaths: (pageIndex: number) => void;
}

/** 默认画笔配置 */
const DEFAULT_DRAWING_CONFIG: DrawingConfig = {
  penColor: '#1a1a1a',
  penWidth: 3,
  drawingEnabled: false,
};

export const useDrawingStore = create<DrawingState>((set, get) => ({
  ...DEFAULT_DRAWING_CONFIG,
  pagePaths: {},
  pageRedoStack: {},

  setPenColor: (penColor) => set({ penColor }),
  setPenWidth: (penWidth) => set({ penWidth: Math.max(1, Math.min(20, penWidth)) }),
  setDrawingEnabled: (drawingEnabled) => set({ drawingEnabled }),

  addPathToPage: (pageIndex, path) =>
    set((state) => {
      const pagePaths = state.pagePaths[pageIndex] || [];
      return {
        pagePaths: {
          ...state.pagePaths,
          [pageIndex]: [...pagePaths, path],
        },
        pageRedoStack: {
          ...state.pageRedoStack,
          [pageIndex]: [],
        },
      };
    }),

  undoPath: (pageIndex) => {
    const { pagePaths, pageRedoStack } = get();
    const paths = pagePaths[pageIndex] || [];
    if (paths.length === 0) return;
    const lastPath = paths[paths.length - 1];
    const redoStack = pageRedoStack[pageIndex] || [];
    set({
      pagePaths: {
        ...pagePaths,
        [pageIndex]: paths.slice(0, -1),
      },
      pageRedoStack: {
        ...pageRedoStack,
        [pageIndex]: [...redoStack, lastPath],
      },
    });
  },

  redoPath: (pageIndex) => {
    const { pagePaths, pageRedoStack } = get();
    const redoStack = pageRedoStack[pageIndex] || [];
    if (redoStack.length === 0) return;
    const nextPath = redoStack[redoStack.length - 1];
    const paths = pagePaths[pageIndex] || [];
    set({
      pagePaths: {
        ...pagePaths,
        [pageIndex]: [...paths, nextPath],
      },
      pageRedoStack: {
        ...pageRedoStack,
        [pageIndex]: redoStack.slice(0, -1),
      },
    });
  },

  clearAllPaths: () => set({ pagePaths: {}, pageRedoStack: {} }),

  clearPagePaths: (pageIndex) =>
    set((state) => {
      const newPagePaths = { ...state.pagePaths };
      const newPageRedoStack = { ...state.pageRedoStack };
      delete newPagePaths[pageIndex];
      delete newPageRedoStack[pageIndex];
      return {
        pagePaths: newPagePaths,
        pageRedoStack: newPageRedoStack,
      };
    }),
}));
