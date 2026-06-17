import { create } from 'zustand';
import type { CopybookConfig, TextType, GridType, DrawingPath, DrawingConfig, PageDrawingPaths, DifficultyLevel, StrokeAnimationState, HeaderFieldConfig, HeaderPosition, PaperTexture, CompletedCells, WatermarkPosition, SortMode, TraceDisplayMode, ColorTheme, WritingDirection } from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';
import { filterByStrokeRange, applySortMode } from '@/utils/strokeCount';
import { parseTextToPages } from '@/utils/textParser';

interface CopybookState extends CopybookConfig, DrawingConfig {
  pagePaths: PageDrawingPaths;
  pageRedoStack: PageDrawingPaths;
  difficultyLevel: DifficultyLevel;
  strokeAnimation: StrokeAnimationState;
  completedCells: CompletedCells;
  originalText: string;
  minStroke: number;
  maxStroke: number;
  sortMode: SortMode;
  interleaveInterval: number;
  setTextType: (type: TextType) => void;
  setText: (text: string) => void;
  setFontId: (fontId: string) => void;
  setGridType: (gridType: GridType) => void;
  setCellSize: (size: number) => void;
  setColsPerRow: (cols: number) => void;
  setRows: (rows: number) => void;
  setWritingDirection: (direction: WritingDirection) => void;
  setFontColor: (color: string) => void;
  setGridColor: (color: string) => void;
  setShowDashed: (show: boolean) => void;
  setShowTrace: (show: boolean) => void;
  setTraceOpacity: (opacity: number) => void;
  setTraceDisplayMode: (mode: TraceDisplayMode) => void;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setNameField: (field: HeaderFieldConfig) => void;
  setDateField: (field: HeaderFieldConfig) => void;
  setClassField: (field: HeaderFieldConfig) => void;
  setHeaderPosition: (position: HeaderPosition) => void;
  setShowLineNumbers: (show: boolean) => void;
  setPaperTexture: (texture: PaperTexture) => void;
  setWatermarkEnabled: (enabled: boolean) => void;
  setWatermarkText: (text: string) => void;
  setWatermarkPosition: (position: WatermarkPosition) => void;
  setWatermarkFontSize: (size: number) => void;
  setWatermarkOpacity: (opacity: number) => void;
  setWatermarkColor: (color: string) => void;
  updateConfig: (partial: Partial<CopybookConfig>) => void;
  resetConfig: () => void;
  setPenColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setDrawingEnabled: (enabled: boolean) => void;
  addPathToPage: (pageIndex: number, path: DrawingPath) => void;
  undoPath: (pageIndex: number) => void;
  redoPath: (pageIndex: number) => void;
  clearAllPaths: () => void;
  clearPagePaths: (pageIndex: number) => void;
  setDifficultyLevel: (level: DifficultyLevel) => void;
  openStrokeAnimation: (char: string) => void;
  closeStrokeAnimation: () => void;
  setCellCompletion: (pageIndex: number, cellKey: string, completion: number) => void;
  clearCompletedCells: () => void;
  getCompletionPercentage: () => number;
  getTotalValidCells: () => number;
  getCompletedCellsCount: () => number;
  setMinStroke: (min: number) => void;
  setMaxStroke: (max: number) => void;
  setSortMode: (mode: SortMode) => void;
  setInterleaveInterval: (interval: number) => void;
  applyStrokeFilter: () => void;
  applyTextSort: () => void;
  resetTextProcessing: () => void;
  applyColorTheme: (theme: ColorTheme) => void;
}

const DEFAULT_CONFIG: CopybookConfig & DrawingConfig = {
  textType: 'chinese',
  text: DEFAULT_TEXTS.chinese,
  fontId: 'kaiti',
  gridType: 'tian',
  cellSize: 64,
  colsPerRow: 10,
  rows: 14,
  writingDirection: 'horizontal-ltr',
  fontColor: '#3D2C1F',
  gridColor: '#D4A574',
  showDashed: true,
  showTrace: true,
  traceOpacity: 0.25,
  traceDisplayMode: 'all',
  title: '',
  subtitle: '',
  nameField: { label: '姓名', visible: true },
  dateField: { label: '日期', visible: true },
  classField: { label: '班级', visible: false },
  headerPosition: 'center',
  showLineNumbers: false,
  paperTexture: 'white',
  watermark: {
    enabled: false,
    text: '练字',
    position: 'cell-corner',
    fontSize: 12,
    opacity: 0.15,
    color: '#8B2E20',
  },
  penColor: '#1a1a1a',
  penWidth: 3,
  drawingEnabled: false,
};

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

const COMPLETION_THRESHOLD = 0.6;

export const useCopybookStore = create<CopybookState>((set, get) => ({
  ...DEFAULT_CONFIG,
  originalText: DEFAULT_TEXTS.chinese,
  minStroke: 1,
  maxStroke: 30,
  sortMode: 'original',
  interleaveInterval: 2,
  pagePaths: {},
  pageRedoStack: {},
  difficultyLevel: 'intermediate',
  strokeAnimation: { isOpen: false, char: '' },
  completedCells: {},

  setTextType: (type) =>
    set(() => {
      let fontId = 'kaiti';
      if (type === 'english') fontId = 'serif';
      else if (type === 'number') fontId = 'kaiti';
      else fontId = 'kaiti';

      return {
        textType: type,
        text: DEFAULT_TEXTS[type],
        originalText: DEFAULT_TEXTS[type],
        fontId,
        colsPerRow: type === 'english' ? 14 : type === 'number' ? 12 : 10,
        rows: 14,
        completedCells: {},
        minStroke: 1,
        maxStroke: 30,
        sortMode: 'original',
      };
    }),

  setText: (text) => set({ text, originalText: text, completedCells: {} }),
  setFontId: (fontId) => set({ fontId }),
  setGridType: (gridType) => set({ gridType }),
  setCellSize: (cellSize) => set({ cellSize: Math.max(32, Math.min(120, cellSize)) }),
  setColsPerRow: (colsPerRow) => set({ colsPerRow: Math.max(4, Math.min(20, colsPerRow)), completedCells: {} }),
  setRows: (rows) => set({ rows: Math.max(4, Math.min(30, rows)), completedCells: {} }),
  setWritingDirection: (writingDirection) => set({ writingDirection, completedCells: {} }),
  setFontColor: (fontColor) => set({ fontColor }),
  setGridColor: (gridColor) => set({ gridColor }),
  setShowDashed: (showDashed) => set({ showDashed }),
  setShowTrace: (showTrace) => set({ showTrace }),
  setTraceOpacity: (traceOpacity) => set({ traceOpacity }),
  setTraceDisplayMode: (traceDisplayMode) => set({ traceDisplayMode }),
  setTitle: (title) => set({ title }),
  setSubtitle: (subtitle) => set({ subtitle }),
  setNameField: (nameField) => set({ nameField }),
  setDateField: (dateField) => set({ dateField }),
  setClassField: (classField) => set({ classField }),
  setHeaderPosition: (headerPosition) => set({ headerPosition }),
  setShowLineNumbers: (showLineNumbers) => set({ showLineNumbers }),
  setPaperTexture: (paperTexture) => set({ paperTexture }),
  setWatermarkEnabled: (enabled) =>
    set((state) => ({
      watermark: { ...state.watermark, enabled },
    })),
  setWatermarkText: (text) =>
    set((state) => ({
      watermark: { ...state.watermark, text },
    })),
  setWatermarkPosition: (position) =>
    set((state) => ({
      watermark: { ...state.watermark, position },
    })),
  setWatermarkFontSize: (fontSize) =>
    set((state) => ({
      watermark: { ...state.watermark, fontSize: Math.max(8, Math.min(48, fontSize)) },
    })),
  setWatermarkOpacity: (opacity) =>
    set((state) => ({
      watermark: { ...state.watermark, opacity: Math.max(0.05, Math.min(0.8, opacity)) },
    })),
  setWatermarkColor: (color) =>
    set((state) => ({
      watermark: { ...state.watermark, color },
    })),
  updateConfig: (partial) => set(partial),
  resetConfig: () => set({ ...DEFAULT_CONFIG, pagePaths: {}, pageRedoStack: {}, completedCells: {} }),

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

  setDifficultyLevel: (level) =>
    set(() => ({
      difficultyLevel: level,
      ...DIFFICULTY_PRESETS[level],
      completedCells: {},
    })),

  openStrokeAnimation: (char) =>
    set({
      strokeAnimation: { isOpen: true, char },
    }),

  closeStrokeAnimation: () =>
    set((state) => ({
      strokeAnimation: { ...state.strokeAnimation, isOpen: false },
    })),

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

  getTotalValidCells: () => {
    const { text, colsPerRow, rows, writingDirection } = get();
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

  getCompletionPercentage: () => {
    const total = get().getTotalValidCells();
    if (total === 0) return 0;
    const completed = get().getCompletedCellsCount();
    return Math.round((completed / total) * 100);
  },

  setMinStroke: (min) => set({ minStroke: Math.max(1, Math.min(min, get().maxStroke)) }),
  setMaxStroke: (max) => set({ maxStroke: Math.max(get().minStroke, Math.min(max, 30)) }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setInterleaveInterval: (interval) => set({ interleaveInterval: Math.max(2, Math.min(interval, 10)) }),

  applyStrokeFilter: () => {
    const { originalText, minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    set({ text: sorted, completedCells: {} });
  },

  applyTextSort: () => {
    const { originalText, minStroke, maxStroke, sortMode, interleaveInterval } = get();
    const { filtered } = filterByStrokeRange(originalText, minStroke, maxStroke);
    const sorted = applySortMode(filtered, sortMode, interleaveInterval);
    set({ text: sorted, completedCells: {} });
  },

  resetTextProcessing: () => {
    const { originalText } = get();
    set({
      text: originalText,
      minStroke: 1,
      maxStroke: 30,
      sortMode: 'original',
      interleaveInterval: 2,
      completedCells: {},
    });
  },

  applyColorTheme: (theme) =>
    set((state) => ({
      fontColor: theme.fontColor,
      gridColor: theme.gridColor,
      paperTexture: theme.paperTexture,
      watermark: {
        ...state.watermark,
        color: theme.watermarkColor,
      },
    })),
}));

export { COMPLETION_THRESHOLD };
