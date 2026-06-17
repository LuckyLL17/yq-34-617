import type { DrawingPath } from '@/types';

/**
 * Canvas 渲染器
 * 负责 Canvas 2D 上下文的基础绘制操作
 * 单一职责：仅处理 Canvas 绘制，不涉及状态管理或事件处理
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }
    this.ctx = ctx;
  }

  /**
   * 清除整个画布
   */
  clear(): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * 绘制单条路径
   */
  drawPath(path: DrawingPath): void {
    if (path.points.length < 2) return;

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
   */
  drawPaths(paths: DrawingPath[]): void {
    for (const path of paths) {
      this.drawPath(path);
    }
  }

  /**
   * 重绘画布（清除后绘制所有路径）
   */
  redraw(paths: DrawingPath[]): void {
    this.clear();
    this.drawPaths(paths);
  }

  /**
   * 绘制临时路径（用于绘制过程中的实时预览）
   */
  drawTempPath(points: { x: number; y: number }[], color: string, lineWidth: number): void {
    if (points.length < 2) return;
    this.drawPath({ points, color, lineWidth });
  }

  /**
   * 设置 Canvas 尺寸，考虑设备像素比
   */
  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取 2D 上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
