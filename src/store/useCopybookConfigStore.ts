import { create } from 'zustand';
import type {
  CopybookConfig,
  TextType,
  GridType,
  WritingDirection,
  TraceDisplayMode,
  HeaderFieldConfig,
  HeaderPosition,
  PaperTexture,
  WatermarkPosition,
  ColorTheme,
} from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';
import { parseTextToPages } from '@/utils/textParser';

interface CopybookConfigState extends CopybookConfig {
  originalText: string;
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
  applyColorTheme: (theme: ColorTheme) => void;
  getTotalValidCells: () => number;
}

const DEFAULT_CONFIG: CopybookConfig = {
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
};

export const useCopybookConfigStore = create<CopybookConfigState>((set, get) => ({
  ...DEFAULT_CONFIG,
  originalText: DEFAULT_TEXTS.chinese,

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
      };
    }),

  setText: (text) => set({ text, originalText: text }),
  setFontId: (fontId) => set({ fontId }),
  setGridType: (gridType) => set({ gridType }),
  setCellSize: (cellSize) => set({ cellSize: Math.max(32, Math.min(120, cellSize)) }),
  setColsPerRow: (colsPerRow) => set({ colsPerRow: Math.max(4, Math.min(20, colsPerRow)) }),
  setRows: (rows) => set({ rows: Math.max(4, Math.min(30, rows)) }),
  setWritingDirection: (writingDirection) => set({ writingDirection }),
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

  resetConfig: () => set({ ...DEFAULT_CONFIG }),

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

  getTotalValidCells: () => {
    const { text, colsPerRow, rows, writingDirection } = get();
    const parsed = parseTextToPages(text, colsPerRow, rows, writingDirection);
    return parsed.totalChars;
  },
}));

export { DEFAULT_CONFIG };
