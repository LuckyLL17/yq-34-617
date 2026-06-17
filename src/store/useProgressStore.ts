import { create } from 'zustand';
import type { CompletedCells, StrokeAnimationState, WritingDirection } from '@/types';
import { parseTextToPages } from '@/utils/textParser';

/**
 * 学习进度 Store
 * 职责：管理单元格完成度、笔画动画状态、完成百分比计算等
 */

/** 完成度阈值，超过该值视为已完成 */
const COMPLETION_THRESHOLD = 0.6;

interface ProgressState {
  /** 各页面单元格完成度 */
  completedCells: CompletedCells;
  /** 笔画动画状态 */
  strokeAnimation: StrokeAnimationState;

  /** 设置单元格完成度 */
  setCellCompletion: (pageIndex: number, cellKey: string, completion: number) => void;
  /** 清空所有完成度记录 */
  clearCompletedCells: () => void;
  /** 打开笔画动画 */
  openStrokeAnimation: (char: string) => void;
  /** 关闭笔画动画 */
  closeStrokeAnimation: () => void;
  /** 获取总有效单元格数 */
  getTotalValidCells: (text: string, colsPerRow: number, rows: number, writingDirection: WritingDirection) => number;
  /** 获取已完成单元格数 */
  getCompletedCellsCount: () => number;
  /** 获取完成百分比 */
  getCompletionPercentage: (text: string, colsPerRow: number, rows: number, writingDirection: WritingDirection) => number;
  /** 重置指定页面的完成度 */
  resetPageCompletion: (pageIndex: number) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedCells: {},
  strokeAnimation: { isOpen: false, char: '' },

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

  openStrokeAnimation: (char) =>
    set({
      strokeAnimation: { isOpen: true, char },
    }),

  closeStrokeAnimation: () =>
    set((state) => ({
      strokeAnimation: { ...state.strokeAnimation, isOpen: false },
    })),

  getTotalValidCells: (text, colsPerRow, rows, writingDirection) => {
    const parsed = parseTextToPages(text, colsPerRow, rows, writingDirection);
    return parsed.totalChars;
  },

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

  getCompletionPercentage: (text, colsPerRow, rows, writingDirection) => {
    const total = get().getTotalValidCells(text, colsPerRow, rows, writingDirection);
    if (total === 0) return 0;
    const completed = get().getCompletedCellsCount();
    return Math.round((completed / total) * 100);
  },

  resetPageCompletion: (pageIndex) =>
    set((state) => {
      const newCompletedCells = { ...state.completedCells };
      delete newCompletedCells[pageIndex];
      return { completedCells: newCompletedCells };
    }),
}));

export { COMPLETION_THRESHOLD };
