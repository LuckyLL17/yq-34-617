export type TextType = 'number' | 'chinese' | 'english';

export type WritingDirection = 'horizontal-ltr' | 'horizontal-rtl' | 'vertical-rtl' | 'vertical-ltr';

export type SortMode = 'original' | 'reverse' | 'shuffle' | 'interleave';

export type GridType = 'tian' | 'mi' | 'hui' | 'none';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type TraceDisplayMode = 'all' | 'every2' | 'every4' | 'firstRow';

export type PaperTexture = 'white' | 'kraft' | 'rice' | 'parchment' | 'newspaper' | 'cream';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  applicableTypes: TextType[];
}

export type HeaderPosition = 'left' | 'center' | 'right';

export type WatermarkPosition = 'cell-corner' | 'page-center';

export interface HeaderFieldConfig {
  label: string;
  visible: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  fontSize: number;
  opacity: number;
  color: string;
}

export interface CopybookConfig {
  textType: TextType;
  text: string;
  fontId: string;
  gridType: GridType;
  cellSize: number;
  colsPerRow: number;
  rows: number;
  writingDirection: WritingDirection;
  fontColor: string;
  gridColor: string;
  showDashed: boolean;
  showTrace: boolean;
  traceOpacity: number;
  traceDisplayMode: TraceDisplayMode;
  title: string;
  subtitle: string;
  nameField: HeaderFieldConfig;
  dateField: HeaderFieldConfig;
  classField: HeaderFieldConfig;
  headerPosition: HeaderPosition;
  showLineNumbers: boolean;
  paperTexture: PaperTexture;
  watermark: WatermarkConfig;
}

export interface CompletedCells {
  [pageIndex: number]: {
    [cellKey: string]: number;
  };
}

export interface PresetText {
  label: string;
  value: string;
  textType: TextType;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

export interface PageDrawingPaths {
  [pageIndex: number]: DrawingPath[];
}

export interface DrawingConfig {
  penColor: string;
  penWidth: number;
  drawingEnabled: boolean;
}

export interface CheckinRecord {
  date: string;
  charCount: number;
  textType: TextType;
  fontId: string;
  timestamp: number;
  posterThumbnail?: string;
}

export interface CheckinStats {
  totalDays: number;
  totalChars: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CheckinStore {
  records: Record<string, CheckinRecord>;
  checkin: (record: Omit<CheckinRecord, 'timestamp'>) => void;
  getRecordByDate: (date: string) => CheckinRecord | undefined;
  getMonthRecords: (year: number, month: number) => Record<string, CheckinRecord>;
  getStats: () => CheckinStats;
  getMaxCharCount: () => number;
}

export interface DifficultyPreset {
  label: string;
  description: string;
  config: Partial<CopybookConfig>;
}

export interface StrokeAnimationState {
  isOpen: boolean;
  char: string;
}

export interface CopybookTemplate {
  id: string;
  name: string;
  config: CopybookConfig;
  createdAt: number;
  updatedAt: number;
  previewText?: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  fontColor: string;
  gridColor: string;
  paperTexture: PaperTexture;
  watermarkColor: string;
  previewColors: string[];
}

export interface TemplateStore {
  templates: CopybookTemplate[];
  selectedTemplateIds: string[];
  saveTemplate: (name: string, config: CopybookConfig) => CopybookTemplate;
  updateTemplate: (id: string, updates: Partial<CopybookTemplate>) => void;
  deleteTemplate: (id: string) => void;
  deleteTemplates: (ids: string[]) => void;
  toggleSelectTemplate: (id: string) => void;
  selectAllTemplates: () => void;
  clearSelection: () => void;
  loadTemplateToConfig: (id: string, applyConfig: (config: CopybookConfig) => void) => void;
}

