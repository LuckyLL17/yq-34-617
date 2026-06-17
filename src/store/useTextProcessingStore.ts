import { create } from 'zustand';
import type { DifficultyLevel, StrokeAnimationState, SortMode, CopybookConfig } from '@/types';
import { filterByStrokeRange, applySortMode } from '@/utils/strokeCount';
import { useCopybookConfigStore } from '@/store/useCopybookConfigStore';
import { useDrawingStore } from '@/store/useDrawingStore';

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

interface TextProcessingState {
  difficultyLevel: DifficultyLevel;
  strokeAnimation: StrokeAnimationState;
  minStroke: number;
  maxStroke: number;
  sortMode: SortMode;
  interleaveInterval: number;
  setDifficultyLevel: (level: DifficultyLevel) => void;
  openStrokeAnimation: (char: string) => void;
  closeStrokeAnimation: () => void;
  setMinStroke: (min: number) => void;
  setMaxStroke: (max: number) => void;
  setSortMode: (mode: SortMode) => void;
  setInterleaveInterval: (interval: number) => void;
  applyStrokeFilter: () => void;
  resetTextProcessing: () => void;
}

export const useTextProcessingStore = create<TextProcessingState>((set, get) => ({
  difficultyLevel: 'intermediate',
  strokeAnimation: { isOpen: false, char: '' },
  minStroke: 1,
  maxStroke: 30,
  sortMode: 'original',
  interleaveInterval: 2,

  setDifficultyLevel: (level) => {
    useCopybookConfigStore.setState({ ...DIFFICULTY_PRESETS[level] });
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

  setMinStroke: (min) => set({ minStroke: Math.max(1, Math.min(min, get().maxStroke)) }),
  setMaxStroke: (max) => set({ maxStroke: Math.max(get().minStroke, Math.min(max, 30)) }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setInterleaveInterval: (interval) => set({ interleaveInterval: Math.max(2, Math.min(interval, 10)) }),

  applyStrokeFilter: () => {
    const { originalText } = useCopybookConfigStore.getState();
    const { minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    useCopybookConfigStore.setState({ text: sorted });
    useDrawingStore.getState().clearCompletedCells();
  },

  resetTextProcessing: () => {
    const { originalText } = useCopybookConfigStore.getState();
    useCopybookConfigStore.setState({ text: originalText });
    useDrawingStore.getState().clearCompletedCells();
    set({
      minStroke: 1,
      maxStroke: 30,
      sortMode: 'original',
      interleaveInterval: 2,
    });
  },
}));

export { DIFFICULTY_PRESETS };
