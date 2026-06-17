import { create } from 'zustand';
import type {
  DifficultyLevel,
  StrokeAnimationState,
  SortMode,
  CopybookConfig,
} from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';
import { filterByStrokeRange, applySortMode } from '@/utils/strokeCount';

/**
 * 难度预设配置
 * 不同难度等级对应的字帖配置
 */
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

/**
 * 文本处理 Store
 * 负责文本内容处理、难度等级、笔画筛选排序、笔画动画等状态管理
 * 职责：管理与文本内容处理相关的状态和逻辑
 */
interface TextState {
  /** 原始文本（未经过滤排序） */
  originalText: string;
  /** 最小笔画数 */
  minStroke: number;
  /** 最大笔画数 */
  maxStroke: number;
  /** 排序模式 */
  sortMode: SortMode;
  /** 交错间隔 */
  interleaveInterval: number;
  /** 难度等级 */
  difficultyLevel: DifficultyLevel;
  /** 笔画动画状态 */
  strokeAnimation: StrokeAnimationState;

  /** 设置最小笔画数 */
  setMinStroke: (min: number) => void;
  /** 设置最大笔画数 */
  setMaxStroke: (max: number) => void;
  /** 设置排序模式 */
  setSortMode: (mode: SortMode) => void;
  /** 设置交错间隔 */
  setInterleaveInterval: (interval: number) => void;
  /** 应用笔画筛选 */
  applyStrokeFilter: () => string;
  /** 应用文本排序 */
  applyTextSort: () => string;
  /** 重置文本处理 */
  resetTextProcessing: () => void;

  /** 设置难度等级（返回对应的配置项供外部应用） */
  setDifficultyLevel: (level: DifficultyLevel) => Partial<CopybookConfig>;

  /** 打开笔画动画 */
  openStrokeAnimation: (char: string) => void;
  /** 关闭笔画动画 */
  closeStrokeAnimation: () => void;

  /** 设置原始文本 */
  setOriginalText: (text: string) => void;
}

export const useTextStore = create<TextState>((set, get) => ({
  originalText: DEFAULT_TEXTS.chinese,
  minStroke: 1,
  maxStroke: 30,
  sortMode: 'original',
  interleaveInterval: 2,
  difficultyLevel: 'intermediate',
  strokeAnimation: { isOpen: false, char: '' },

  setMinStroke: (min) => set({ minStroke: Math.max(1, Math.min(min, get().maxStroke)) }),
  setMaxStroke: (max) => set({ maxStroke: Math.max(get().minStroke, Math.min(max, 30)) }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setInterleaveInterval: (interval) =>
    set({ interleaveInterval: Math.max(2, Math.min(interval, 10)) }),

  applyStrokeFilter: () => {
    const { originalText, minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    return sorted;
  },

  applyTextSort: () => {
    const { originalText, minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    return sorted;
  },

  resetTextProcessing: () => {
    set({
      minStroke: 1,
      maxStroke: 30,
      sortMode: 'original',
      interleaveInterval: 2,
    });
    return get().originalText;
  },

  setDifficultyLevel: (level) => {
    set({ difficultyLevel: level });
    return DIFFICULTY_PRESETS[level];
  },

  openStrokeAnimation: (char) =>
    set({
      strokeAnimation: { isOpen: true, char },
    }),

  closeStrokeAnimation: () =>
    set((state) => ({
      strokeAnimation: { ...state.strokeAnimation, isOpen: false },
    })),

  setOriginalText: (text) => set({ originalText: text }),
}));

export { DIFFICULTY_PRESETS };
