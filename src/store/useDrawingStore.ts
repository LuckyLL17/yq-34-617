import { create } from 'zustand';
import type { DrawingPath, DrawingConfig, PageDrawingPaths, CompletedCells } from '@/types';
import { useCopybookConfigStore } from '@/store/useCopybookConfigStore';

const COMPLETION_THRESHOLD = 0.6;

interface DrawingState extends DrawingConfig {
  pagePaths: PageDrawingPaths;
  pageRedoStack: PageDrawingPaths;
  completedCells: CompletedCells;
  setPenColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setDrawingEnabled: (enabled: boolean) => void;
  addPathToPage: (pageIndex: number, path: DrawingPath) => void;
  undoPath: (pageIndex: number) => void;
  redoPath: (pageIndex: number) => void;
  clearAllPaths: () => void;
  clearPagePaths: (pageIndex: number) => void;
  setCellCompletion: (pageIndex: number, cellKey: string, completion: number) => void;
  clearCompletedCells: () => void;
  getCompletedCellsCount: () => number;
  getCompletionPercentage: () => number;
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

  getCompletionPercentage: () => {
    const total = useCopybookConfigStore.getState().getTotalValidCells();
    if (total === 0) return 0;
    const completed = get().getCompletedCellsCount();
    return Math.round((completed / total) * 100);
  },
}));

export { COMPLETION_THRESHOLD };
