import { create } from 'zustand';
import type {
  CopybookConfig,
  DifficultyLevel,
  StrokeAnimationState,
  SortMode,
} from '@/types';
import { filterByStrokeRange, applySortMode } from '@/utils/strokeCount';
import { parseTextToPages } from '@/utils/textParser';
import { useConfigStore } from './useConfigStore';
import { useDrawingStore, COMPLETION_THRESHOLD } from './useDrawingStore';

/**
 * 练习状态管理
 * 负责管理练习相关的状态：难度等级、笔画动画、文本处理、完成度统计
 */
interface PracticeState {
  /** 难度等级 */
  difficultyLevel: DifficultyLevel;
  /** 笔画动画状态 */
  strokeAnimation: StrokeAnimationState;
  /** 原始文本（未经过滤排序） */
  originalText: string;
  /** 最小笔画数筛选 */
  minStroke: number;
  /** 最大笔画数筛选 */
  maxStroke: number;
  /** 排序模式 */
  sortMode: SortMode;
  /** 交错间隔（用于交错排序模式） */
  interleaveInterval: number;
  /** 设置难度等级 */
  setDifficultyLevel: (level: DifficultyLevel) => void;
  /** 打开笔画动画 */
  openStrokeAnimation: (char: string) => void;
  /** 关闭笔画动画 */
  closeStrokeAnimation: () => void;
  /** 设置最小笔画数 */
  setMinStroke: (min: number) => void;
  /** 设置最大笔画数 */
  setMaxStroke: (max: number) => void;
  /** 设置排序模式 */
  setSortMode: (mode: SortMode) => void;
  /** 设置交错间隔 */
  setInterleaveInterval: (interval: number) => void;
  /** 应用笔画筛选 */
  applyStrokeFilter: () => void;
  /** 应用文本排序 */
  applyTextSort: () => void;
  /** 重置文本处理 */
  resetTextProcessing: () => void;
  /** 获取总有效单元格数 */
  getTotalValidCells: () => number;
  /** 获取已完成单元格数 */
  getCompletedCellsCount: () => number;
  /** 获取完成百分比 */
  getCompletionPercentage: () => number;
}

/** 难度预设配置 */
const DIFFICULTY_PRESETS: Record<DifficultyLevel, Partial<CopybookConfig>> = {
  beginner: {
    cellSize: 80,
    colsPerRow: 8,
    rows: 10,
    gridType: 'mi',
    showDashed: true,
    showTrace: true,
    traceOpacity: 0.4,
  },
  intermediate: {
    cellSize: 64,
    colsPerRow: 10,
    rows: 14,
    gridType: 'tian',
    showDashed: true,
    showTrace: true,
    traceOpacity: 0.25,
  },
  advanced: {
    cellSize: 48,
    colsPerRow: 14,
    rows: 18,
    gridType: 'hui',
    showDashed: false,
    showTrace: false,
    traceOpacity: 0.1,
  },
};

export const usePracticeStore = create<PracticeState>((set, get) => ({
  difficultyLevel: 'intermediate',
  strokeAnimation: { isOpen: false, char: '' },
  originalText: '',
  minStroke: 1,
  maxStroke: 30,
  sortMode: 'original',
  interleaveInterval: 2,

  setDifficultyLevel: (level) => {
    const preset = DIFFICULTY_PRESETS[level];
    useConfigStore.getState().updateConfig(preset);
    useDrawingStore.getState().clearCompletedCells();
    set({ difficultyLevel: level });
  },

  openStrokeAnimation: (char) =>
    set({
      strokeAnimation: { isOpen: true, char },
    }),

  closeStrokeAnimation: () =>
    set((state) => ({
      strokeAnimation: { ...state.strokeAnimation, isOpen: false },
    })),

  setMinStroke: (min) =>
    set({ minStroke: Math.max(1, Math.min(min, get().maxStroke)) }),
  setMaxStroke: (max) =>
    set({ maxStroke: Math.max(get().minStroke, Math.min(max, 30)) }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setInterleaveInterval: (interval) =>
    set({ interleaveInterval: Math.max(2, Math.min(interval, 10)) }),

  applyStrokeFilter: () => {
    const { originalText, minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    useConfigStore.getState().setText(sorted);
    useDrawingStore.getState().clearCompletedCells();
  },

  applyTextSort: () => {
    const { originalText, minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    useConfigStore.getState().setText(sorted);
    useDrawingStore.getState().clearCompletedCells();
  },

  resetTextProcessing: () => {
    const { originalText } = get();
    useConfigStore.getState().setText(originalText);
    useDrawingStore.getState().clearCompletedCells();
    set({
      minStroke: 1,
      maxStroke: 30,
      sortMode: 'original',
      interleaveInterval: 2,
    });
  },

  getTotalValidCells: () => {
    const { text, colsPerRow, rows, writingDirection } = useConfigStore.getState();
    const parsed = parseTextToPages(text, colsPerRow, rows, writingDirection);
    return parsed.totalChars;
  },

  getCompletedCellsCount: () => {
    const { completedCells } = useDrawingStore.getState();
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
    const total = get().getTotalValidCells();
    if (total === 0) return 0;
    const completed = get().getCompletedCellsCount();
    return Math.round((completed / total) * 100);
  },
}));

export { DIFFICULTY_PRESETS };
