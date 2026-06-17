import { create } from 'zustand';
import type { DrawingPath, PageDrawingPaths, DrawingConfig, CompletedCells } from '@/types';

/**
 * 绘图状态管理
 * 负责管理绘图相关的状态：画笔配置、绘图路径、撤销重做、单元格完成度
 */
interface DrawingState extends DrawingConfig {
  /** 各页的绘图路径 */
  pagePaths: PageDrawingPaths;
  /** 各页的重做栈 */
  pageRedoStack: PageDrawingPaths;
  /** 各单元格完成度 */
  completedCells: CompletedCells;
  /** 设置画笔颜色 */
  setPenColor: (color: string) => void;
  /** 设置画笔宽度 */
  setPenWidth: (width: number) => void;
  /** 设置是否启用绘图 */
  setDrawingEnabled: (enabled: boolean) => void;
  /** 向指定页面添加路径 */
  addPathToPage: (pageIndex: number, path: DrawingPath) => void;
  /** 撤销指定页面的最后一条路径 */
  undoPath: (pageIndex: number) => void;
  /** 重做指定页面的最后一条撤销路径 */
  redoPath: (pageIndex: number) => void;
  /** 清除所有页面的所有路径 */
  clearAllPaths: () => void;
  /** 清除指定页面的所有路径 */
  clearPagePaths: (pageIndex: number) => void;
  /** 设置单元格完成度 */
  setCellCompletion: (pageIndex: number, cellKey: string, completion: number) => void;
  /** 清除所有完成度记录 */
  clearCompletedCells: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  penColor: '#1a1a1a',
  penWidth: 3,
  drawingEnabled: false,
  pagePaths: {},
  pageRedoStack: {},
  completedCells: {},

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

  clearAllPaths: () => set({ pagePaths: {}, pageRedoStack: {}, completedCells: {} }),

  clearPagePaths: (pageIndex) =>
    set((state) => {
      const newPagePaths = { ...state.pagePaths };
      const newPageRedoStack = { ...state.pageRedoStack };
      const newCompletedCells = { ...state.completedCells };
      delete newPagePaths[pageIndex];
      delete newPageRedoStack[pageIndex];
      delete newCompletedCells[pageIndex];
      return {
        pagePaths: newPagePaths,
        pageRedoStack: newPageRedoStack,
        completedCells: newCompletedCells,
      };
    }),

  setCellCompletion: (pageIndex, cellKey, completion) =>
    set((state) => {
      const pageCompleted = state.completedCells[pageIndex] || {};
      const newPageCompleted = { ...pageCompleted, [cellKey]: completion };
      return {
        completedCells: {
          ...state.completedCells,
          [pageIndex]: newPageCompleted,
        },
      };
    }),

  clearCompletedCells: () => set({ completedCells: {} }),
}));

/** 完成度阈值，超过此值视为完成 */
export const COMPLETION_THRESHOLD = 0.6;
