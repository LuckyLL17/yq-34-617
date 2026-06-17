import { create } from 'zustand';
import type { DrawingPath, PageDrawingPaths, DrawingConfig, CompletedCells } from '@/types';

/**
 * 完成度阈值
 * 单元格完成度达到此阈值即视为完成
 */
export const COMPLETION_THRESHOLD = 0.6;

/**
 * 绘图状态 Store
 * 负责绘图画笔、路径、撤销/重做、完成度等状态管理
 * 职责：管理所有与用户绘图交互相关的状态
 */
interface DrawingState extends DrawingConfig {
  /** 每页的绘图路径 */
  pagePaths: PageDrawingPaths;
  /** 每页的重做栈 */
  pageRedoStack: PageDrawingPaths;
  /** 每页的单元格完成度 */
  completedCells: CompletedCells;

  /** 画笔颜色设置器 */
  setPenColor: (color: string) => void;
  /** 画笔宽度设置器 */
  setPenWidth: (width: number) => void;
  /** 绘图模式开关 */
  setDrawingEnabled: (enabled: boolean) => void;

  /** 添加路径到指定页面 */
  addPathToPage: (pageIndex: number, path: DrawingPath) => void;
  /** 撤销指定页面的上一条路径 */
  undoPath: (pageIndex: number) => void;
  /** 重做指定页面的下一条路径 */
  redoPath: (pageIndex: number) => void;
  /** 清除所有页面的路径 */
  clearAllPaths: () => void;
  /** 清除指定页面的路径 */
  clearPagePaths: (pageIndex: number) => void;

  /** 设置单元格完成度 */
  setCellCompletion: (pageIndex: number, cellKey: string, completion: number) => void;
  /** 清除所有完成度记录 */
  clearCompletedCells: () => void;

  /** 获取总有效单元格数（需要传入计算函数，避免循环依赖） */
  getCompletionPercentage: (totalValidCells: number) => number;
  /** 获取已完成单元格数 */
  getCompletedCellsCount: () => number;
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

  getCompletedCellsCount: () => {
    const { completedCells } = get();
    let count = 0;
    for (const pageIdx in completedCells) {
      const pageCells = completedCells[Number(pageIdx)];
      for (const key in pageCells) {
        if (pageCells[key] >= COMPLETION_THRESHOLD) {
          count++;
        }
      }
    }
    return count;
  },

  getCompletionPercentage: (totalValidCells) => {
    if (totalValidCells === 0) return 0;
    const completed = get().getCompletedCellsCount();
    return Math.round((completed / totalValidCells) * 100);
  },
}));
