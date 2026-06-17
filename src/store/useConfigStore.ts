import { create } from 'zustand';
import type {
  CopybookConfig,
  TextType,
  GridType,
  HeaderFieldConfig,
  HeaderPosition,
  PaperTexture,
  WatermarkPosition,
  ColorTheme,
  WritingDirection,
  TraceDisplayMode,
} from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';

/**
 * 字帖配置状态管理
 * 负责管理字帖的所有配置项：文本、字体、网格、颜色、水印、页眉等
 */
interface ConfigState extends CopybookConfig {
  /** 设置文本类型 */
  setTextType: (type: TextType) => void;
  /** 设置文本内容 */
  setText: (text: string) => void;
  /** 设置字体ID */
  setFontId: (fontId: string) => void;
  /** 设置网格类型 */
  setGridType: (gridType: GridType) => void;
  /** 设置单元格大小 */
  setCellSize: (size: number) => void;
  /** 设置每行列数 */
  setColsPerRow: (cols: number) => void;
  /** 设置行数 */
  setRows: (rows: number) => void;
  /** 设置书写方向 */
  setWritingDirection: (direction: WritingDirection) => void;
  /** 设置字体颜色 */
  setFontColor: (color: string) => void;
  /** 设置网格颜色 */
  setGridColor: (color: string) => void;
  /** 设置是否显示虚线 */
  setShowDashed: (show: boolean) => void;
  /** 设置是否显示描红 */
  setShowTrace: (show: boolean) => void;
  /** 设置描红透明度 */
  setTraceOpacity: (opacity: number) => void;
  /** 设置描红显示模式 */
  setTraceDisplayMode: (mode: TraceDisplayMode) => void;
  /** 设置标题 */
  setTitle: (title: string) => void;
  /** 设置副标题 */
  setSubtitle: (subtitle: string) => void;
  /** 设置姓名字段 */
  setNameField: (field: HeaderFieldConfig) => void;
  /** 设置日期字段 */
  setDateField: (field: HeaderFieldConfig) => void;
  /** 设置班级字段 */
  setClassField: (field: HeaderFieldConfig) => void;
  /** 设置页眉位置 */
  setHeaderPosition: (position: HeaderPosition) => void;
  /** 设置是否显示行号 */
  setShowLineNumbers: (show: boolean) => void;
  /** 设置纸张纹理 */
  setPaperTexture: (texture: PaperTexture) => void;
  /** 设置水印是否启用 */
  setWatermarkEnabled: (enabled: boolean) => void;
  /** 设置水印文字 */
  setWatermarkText: (text: string) => void;
  /** 设置水印位置 */
  setWatermarkPosition: (position: WatermarkPosition) => void;
  /** 设置水印字体大小 */
  setWatermarkFontSize: (size: number) => void;
  /** 设置水印透明度 */
  setWatermarkOpacity: (opacity: number) => void;
  /** 设置水印颜色 */
  setWatermarkColor: (color: string) => void;
  /** 批量更新配置 */
  updateConfig: (partial: Partial<CopybookConfig>) => void;
  /** 重置为默认配置 */
  resetConfig: () => void;
  /** 应用颜色主题 */
  applyColorTheme: (theme: ColorTheme) => void;
}

/** 默认配置 */
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

export const useConfigStore = create<ConfigState>((set) => ({
  ...DEFAULT_CONFIG,

  setTextType: (type) =>
    set(() => {
      let fontId = 'kaiti';
      if (type === 'english') fontId = 'serif';
      else if (type === 'number') fontId = 'kaiti';
      else fontId = 'kaiti';

      return {
        textType: type,
        text: DEFAULT_TEXTS[type],
        fontId,
        colsPerRow: type === 'english' ? 14 : type === 'number' ? 12 : 10,
        rows: 14,
      };
    }),

  setText: (text) => set({ text }),
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
}));

export { DEFAULT_CONFIG };
