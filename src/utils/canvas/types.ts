import type { DrawingPath } from '@/types';

/**
 * Canvas 渲染配置
 */
export interface CanvasRenderConfig {
  /** 画布宽度（CSS 像素） */
  width: number;
  /** 画布高度（CSS 像素） */
  height: number;
  /** 设备像素比 */
  dpr: number;
}

/**
 * 点坐标
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 单元格信息
 */
export interface CellInfo {
  /** 单元格 X 坐标 */
  x: number;
  /** 单元格 Y 坐标 */
  y: number;
  /** 单元格大小 */
  size: number;
  /** 行索引 */
  row: number;
  /** 列索引 */
  col: number;
}

/**
 * Canvas 引擎接口
 * 封装 Canvas 的基础操作
 */
export interface ICanvasEngine {
  /** 获取 2D 渲染上下文 */
  getContext(): CanvasRenderingContext2D | null;
  /** 获取 Canvas 元素 */
  getCanvas(): HTMLCanvasElement | null;
  /** 初始化画布尺寸 */
  resize(config: CanvasRenderConfig): void;
  /** 清除画布 */
  clear(): void;
  /** 保存绘图状态 */
  save(): void;
  /** 恢复绘图状态 */
  restore(): void;
}
