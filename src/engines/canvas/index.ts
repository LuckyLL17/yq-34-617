/**
 * Canvas 渲染引擎模块
 * 
 * 包含以下子模块：
 * - DrawingCanvasEngine: 绘图 Canvas 渲染引擎
 * - CellCoverageCalculator: 单元格覆盖率计算器
 * - PageCaptureEngine: 页面捕获/导出引擎
 */

export { DrawingCanvasEngine } from './DrawingCanvasEngine';
export { CellCoverageCalculator } from './CellCoverageCalculator';
export { PageCaptureEngine } from './PageCaptureEngine';
export * from './types';
export type { CapturedPage, RenderedPages } from './PageCaptureEngine';
