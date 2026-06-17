import type { DrawingPath } from '@/types';

/**
 * Canvas 渲染引擎类型定义
 */

/** 点坐标 */
export interface Point {
  x: number;
  y: number;
}

/** 绘制路径样式 */
export interface PathStyle {
  color: string;
  lineWidth: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
}

/** Canvas 尺寸配置 */
export interface CanvasSize {
  width: number;
  height: number;
}

/** 单元格覆盖率计算参数 */
export interface CellCoverageParams {
  cellX: number;
  cellY: number;
  cellSize: number;
  paths: DrawingPath[];
}

/** 网格配置 */
export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;
  lineNumberWidth?: number;
}
