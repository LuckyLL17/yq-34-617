/**
 * Canvas 渲染引擎模块
 *
 * 提供 Canvas 渲染相关的核心类和工具：
 * - CanvasEngine: Canvas 基础引擎，管理画布尺寸、清除等基础操作
 * - PathRenderer: 路径渲染器，负责绘制线条路径
 * - CellCoverageCalculator: 单元格覆盖率计算器，计算绘图完成度
 *
 * 设计原则：
 * - 单一职责：每个类只负责一项功能
 * - 可组合：可以根据需要组合使用不同的类
 * - 无副作用：纯计算逻辑不依赖外部状态
 */

export { CanvasEngine } from './CanvasEngine';
export { PathRenderer } from './PathRenderer';
export { CellCoverageCalculator } from './CellCoverageCalculator';
export * from './types';
