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
 * 默认配置
 * 集中管理字帖的所有默认配置项
 */
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

/**
 * 配置管理 Store
 * 负责字帖所有可视化配置项的状态管理
 * 职责：管理字帖的外观、布局、样式等配置
 */
interface ConfigState extends CopybookConfig {
  /** 文本类型设置器 */
  setTextType: (type: TextType) => void;
  /** 文本内容设置器 */
  setText: (text: string) => void;
  /** 字体设置器 */
  setFontId: (fontId: string) => void;
  /** 格子类型设置器 */
  setGridType: (gridType: GridType) => void;
  /** 单元格大小设置器 */
  setCellSize: (size: number) => void;
  /** 每行列数设置器 */
  setColsPerRow: (cols: number) => void;
  /** 行数设置器 */
  setRows: (rows: number) => void;
  /** 书写方向设置器 */
  setWritingDirection: (direction: WritingDirection) => void;
  /** 字体颜色设置器 */
  setFontColor: (color: string) => void;
  /** 格子颜色设置器 */
  setGridColor: (color: string) => void;
  /** 是否显示虚线设置器 */
  setShowDashed: (show: boolean) => void;
  /** 是否显示描红设置器 */
  setShowTrace: (show: boolean) => void;
  /** 描红透明度设置器 */
  setTraceOpacity: (opacity: number) => void;
  /** 描红显示模式设置器 */
  setTraceDisplayMode: (mode: TraceDisplayMode) => void;
  /** 标题设置器 */
  setTitle: (title: string) => void;
  /** 副标题设置器 */
  setSubtitle: (subtitle: string) => void;
  /** 姓名字段设置器 */
  setNameField: (field: HeaderFieldConfig) => void;
  /** 日期字段设置器 */
  setDateField: (field: HeaderFieldConfig) => void;
  /** 班级字段设置器 */
  setClassField: (field: HeaderFieldConfig) => void;
  /** 表头位置设置器 */
  setHeaderPosition: (position: HeaderPosition) => void;
  /** 是否显示行号设置器 */
  setShowLineNumbers: (show: boolean) => void;
  /** 纸张纹理设置器 */
  setPaperTexture: (texture: PaperTexture) => void;
  /** 水印开关设置器 */
  setWatermarkEnabled: (enabled: boolean) => void;
  /** 水印文字设置器 */
  setWatermarkText: (text: string) => void;
  /** 水印位置设置器 */
  setWatermarkPosition: (position: WatermarkPosition) => void;
  /** 水印字体大小设置器 */
  setWatermarkFontSize: (size: number) => void;
  /** 水印透明度设置器 */
  setWatermarkOpacity: (opacity: number) => void;
  /** 水印颜色设置器 */
  setWatermarkColor: (color: string) => void;
  /** 批量更新配置 */
  updateConfig: (partial: Partial<CopybookConfig>) => void;
  /** 重置为默认配置 */
  resetConfig: () => void;
  /** 应用颜色主题 */
  applyColorTheme: (theme: ColorTheme) => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
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
