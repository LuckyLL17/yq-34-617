import type { DrawingPath } from '@/types';
import type { Point } from './types';

/**
 * 路径渲染器
 * 负责在 Canvas 上绘制线条路径
 * 职责：封装路径绘制的所有逻辑，包括样式设置、路径绘制等
 */
export class PathRenderer {
  private ctx: CanvasRenderingContext2D | null = null;

  /**
   * 设置渲染上下文
   * @param ctx - Canvas 2D 渲染上下文
   */
  setContext(ctx: CanvasRenderingContext2D | null): void {
    this.ctx = ctx;
  }

  /**
   * 绘制单条路径
   * @param path - 绘图路径
   */
  drawPath(path: DrawingPath): void {
    if (!this.ctx || path.points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = path.color;
    this.ctx.lineWidth = path.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      this.ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    this.ctx.stroke();
  }

  /**
   * 批量绘制多条路径
   * @param paths - 绘图路径数组
   */
  drawPaths(paths: DrawingPath[]): void {
    for (const path of paths) {
      this.drawPath(path);
    }
  }

  /**
   * 绘制点数组为临时路径
   * 用于绘制当前正在绘制的路径
   * @param points - 点数组
   * @param color - 线条颜色
   * @param lineWidth - 线条宽度
   */
  drawTempPath(points: Point[], color: string, lineWidth: number): void {
    if (points.length < 2) return;
    this.drawPath({
      points,
      color,
      lineWidth,
    });
  }

  /**
   * 计算两点之间的距离
   * @param p1 - 点1
   * @param p2 - 点2
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算路径总长度
   * @param points - 点数组
   */
  static pathLength(points: Point[]): number {
    if (points.length < 2) return 0;
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += this.distance(points[i - 1], points[i]);
    }
    return length;
  }
}
