import { create } from 'zustand';
import type { TextType, SortMode } from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';
import { filterByStrokeRange, applySortMode } from '@/utils/strokeCount';

/**
 * 文本处理 Store
 * 职责：管理原始文本、笔画筛选、排序模式等文本处理相关状态
 */

interface TextProcessingState {
  /** 原始文本（未经过滤排序） */
  originalText: string;
  /** 最少笔画数 */
  minStroke: number;
  /** 最多笔画数 */
  maxStroke: number;
  /** 排序模式 */
  sortMode: SortMode;
  /** 间隔排序的间隔数 */
  interleaveInterval: number;

  /** 设置最少笔画数 */
  setMinStroke: (min: number) => void;
  /** 设置最多笔画数 */
  setMaxStroke: (max: number) => void;
  /** 设置排序模式 */
  setSortMode: (mode: SortMode) => void;
  /** 设置间隔排序间隔数 */
  setInterleaveInterval: (interval: number) => void;
  /** 应用笔画筛选 */
  applyStrokeFilter: () => string;
  /** 应用文本排序 */
  applyTextSort: () => string;
  /** 重置文本处理状态 */
  resetTextProcessing: () => { text: string; minStroke: number; maxStroke: number; sortMode: SortMode; interleaveInterval: number };
  /** 设置原始文本 */
  setOriginalText: (text: string) => void;
  /** 根据文本类型重置 */
  resetByTextType: (type: TextType) => void;
}

export const useTextProcessingStore = create<TextProcessingState>((set, get) => ({
  originalText: DEFAULT_TEXTS.chinese,
  minStroke: 1,
  maxStroke: 30,
  sortMode: 'original',
  interleaveInterval: 2,

  setMinStroke: (min) => set({ minStroke: Math.max(1, Math.min(min, get().maxStroke)) }),
  setMaxStroke: (max) => set({ maxStroke: Math.max(get().minStroke, Math.min(max, 30)) }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setInterleaveInterval: (interval) => set({ interleaveInterval: Math.max(2, Math.min(interval, 10)) }),
  setOriginalText: (text) => set({ originalText: text }),

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
    const { originalText } = get();
    const resetState = {
      minStroke: 1,
      maxStroke: 30,
      sortMode: 'original' as SortMode,
      interleaveInterval: 2,
    };
    set(resetState);
    return { text: originalText, ...resetState };
  },

  resetByTextType: (type) => {
    set({
      originalText: DEFAULT_TEXTS[type],
      minStroke: 1,
      maxStroke: 30,
      sortMode: 'original',
    });
  },
}));
