import type { ICanvasEngine, CanvasRenderConfig } from './types';

/**
 * Canvas 渲染引擎
 * 封装 Canvas 的基础操作，提供统一的绘图接口
 * 职责：管理 Canvas 元素的生命周期和基础渲染操作
 */
export class CanvasEngine implements ICanvasEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dpr = 1;

  /**
   * 构造函数
   * @param canvas - Canvas 元素引用
   */
  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.attach(canvas);
    }
  }

  /**
   * 绑定 Canvas 元素
   * @param canvas - Canvas 元素
   */
  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * 解绑 Canvas 元素
   */
  detach(): void {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * 获取 2D 渲染上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /**
   * 获取设备像素比
   */
  getDpr(): number {
    return this.dpr;
  }

  /**
   * 调整画布尺寸
   * 处理高 DPI 屏幕的清晰度问题
   * @param config - 渲染配置
   */
  resize(config: CanvasRenderConfig): void {
    if (!this.canvas || !this.ctx) return;

    const { width, height, dpr } = config;
    this.dpr = dpr;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
  }

  /**
   * 清除画布内容
   */
  clear(): void {
    if (!this.canvas || !this.ctx) return;

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * 保存绘图状态
   */
  save(): void {
    this.ctx?.save();
  }

  /**
   * 恢复绘图状态
   */
  restore(): void {
    this.ctx?.restore();
  }

  /**
   * 将客户端坐标转换为 Canvas 内部坐标
   * @param clientX - 客户端 X 坐标
   * @param clientY - 客户端 Y 坐标
   * @returns Canvas 内部坐标，或 null 如果 Canvas 不存在
   */
  clientToCanvas(clientX: number, clientY: number): { x: number; y: number } | null {
    if (!this.canvas) return null;

    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * 检查点是否在 Canvas 范围内
   * @param x - X 坐标（Canvas 内部坐标）
   * @param y - Y 坐标（Canvas 内部坐标）
   */
  isPointInCanvas(x: number, y: number): boolean {
    if (!this.canvas) return false;
    return x >= 0 && x <= this.canvas.width / this.dpr && y >= 0 && y <= this.canvas.height / this.dpr;
  }
}
