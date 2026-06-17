import type { DrawingPath } from '@/types';
import type { Point, PathStyle, CanvasSize } from './types';

/**
 * 绘图 Canvas 渲染引擎
 * 职责：负责 Canvas 的初始化、路径绘制、重绘等底层渲染操作
 * 单一职责：只处理 Canvas 2D 渲染相关逻辑，不涉及状态管理和业务逻辑
 */
export class DrawingCanvasEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dpr: number = 1;
  private logicalWidth: number = 0;
  private logicalHeight: number = 0;

  /**
   * 绑定 Canvas 元素并初始化
   * @param canvas - Canvas DOM 元素
   * @param width - 逻辑宽度（CSS 像素）
   * @param height - 逻辑高度（CSS 像素）
   */
  attach(canvas: HTMLCanvasElement, width: number, height: number): void {
    this.canvas = canvas;
    this.dpr = window.devicePixelRatio || 1;
    this.logicalWidth = width;
    this.logicalHeight = height;

    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(this.dpr, this.dpr);
      this.ctx = ctx;
    }
  }

  /**
   * 更新 Canvas 尺寸
   * @param width - 新的逻辑宽度
   * @param height - 新的逻辑高度
   */
  resize(width: number, height: number): void {
    if (!this.canvas || !this.ctx) return;

    this.logicalWidth = width;
    this.logicalHeight = height;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * 清空整个 Canvas
   */
  clear(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * 绘制单条路径
   * @param path - 绘制路径数据
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
   * 绘制多条路径
   * @param paths - 路径数组
   */
  drawPaths(paths: DrawingPath[]): void {
    for (const path of paths) {
      this.drawPath(path);
    }
  }

  /**
   * 重绘整个 Canvas（清空后重绘所有路径）
   * @param paths - 所有路径
   */
  redraw(paths: DrawingPath[]): void {
    this.clear();
    this.drawPaths(paths);
  }

  /**
   * 绘制临时路径（用于鼠标移动时的实时预览）
   * @param points - 路径点数组
   * @param style - 路径样式
   */
  drawTemporaryPath(points: Point[], style: PathStyle): void {
    if (!this.ctx || points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = style.color;
    this.ctx.lineWidth = style.lineWidth;
    this.ctx.lineCap = style.lineCap || 'round';
    this.ctx.lineJoin = style.lineJoin || 'round';

    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();
  }

  /**
   * 将页面坐标转换为 Canvas 逻辑坐标
   * @param clientX - 鼠标 X 坐标（相对于视口）
   * @param clientY - 鼠标 Y 坐标（相对于视口）
   * @returns Canvas 逻辑坐标，若 Canvas 不存在则返回 null
   */
  getCanvasCoords(clientX: number, clientY: number): Point | null {
    if (!this.canvas) return null;

    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * 检查坐标是否在 Canvas 范围内
   * @param clientX - 鼠标 X 坐标（相对于视口）
   * @param clientY - 鼠标 Y 坐标（相对于视口）
   * @returns 是否在范围内
   */
  isPointInCanvas(clientX: number, clientY: number): boolean {
    if (!this.canvas) return false;

    const rect = this.canvas.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  /**
   * 获取 Canvas 逻辑尺寸
   */
  getSize(): CanvasSize {
    return {
      width: this.logicalWidth,
      height: this.logicalHeight,
    };
  }

  /**
   * 获取设备像素比
   */
  getDPR(): number {
    return this.dpr;
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * 获取 2D 上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /**
   * 销毁引擎，释放引用
   */
  destroy(): void {
    this.canvas = null;
    this.ctx = null;
  }
}
