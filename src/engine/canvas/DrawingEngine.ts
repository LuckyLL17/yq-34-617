import type { DrawingPath } from '@/types';
import { CanvasRenderer } from './CanvasRenderer';

/**
 * 绘图引擎事件回调
 */
export interface DrawingEngineCallbacks {
  /** 路径完成时回调 */
  onPathComplete?: (path: DrawingPath) => void;
  /** 绘制过程中实时回调（可选） */
  onDrawing?: () => void;
}

/**
 * 绘图引擎
 * 负责处理绘图交互逻辑：鼠标/触摸事件、路径点收集、实时预览
 * 单一职责：仅处理交互逻辑，渲染委托给 CanvasRenderer
 */
export class DrawingEngine {
  private renderer: CanvasRenderer;
  private callbacks: DrawingEngineCallbacks;
  private isDrawing = false;
  private currentPath: { x: number; y: number }[] = [];
  private lastPoint: { x: number; y: number } | null = null;
  private penColor = '#1a1a1a';
  private penWidth = 3;
  private enabled = false;

  constructor(renderer: CanvasRenderer, callbacks: DrawingEngineCallbacks = {}) {
    this.renderer = renderer;
    this.callbacks = callbacks;
  }

  /**
   * 设置画笔颜色
   */
  setPenColor(color: string): void {
    this.penColor = color;
  }

  /**
   * 设置画笔宽度
   */
  setPenWidth(width: number): void {
    this.penWidth = width;
  }

  /**
   * 设置是否启用绘图
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 检查是否正在绘图
   */
  isDrawingActive(): boolean {
    return this.isDrawing;
  }

  /**
   * 获取 Canvas 元素的坐标
   */
  private getCanvasCoords(clientX: number, clientY: number): { x: number; y: number } | null {
    const canvas = this.renderer.getCanvas();
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * 从鼠标/触摸事件中获取坐标
   */
  getCoordsFromEvent(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null {
    const nativeEvent = e.nativeEvent;
    if ('touches' in nativeEvent && nativeEvent.touches.length > 0) {
      return this.getCanvasCoords(nativeEvent.touches[0].clientX, nativeEvent.touches[0].clientY);
    } else if ('clientX' in nativeEvent) {
      return this.getCanvasCoords(nativeEvent.clientX, nativeEvent.clientY);
    }
    return null;
  }

  /**
   * 从原生鼠标/触摸事件中获取坐标
   */
  getCoordsFromNativeEvent(e: MouseEvent | TouchEvent): { x: number; y: number } | null {
    const canvas = this.renderer.getCanvas();
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    } else {
      return null;
    }

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * 开始绘图
   */
  startDrawing(coords: { x: number; y: number }): void {
    if (!this.enabled) return;
    this.isDrawing = true;
    this.currentPath = [coords];
    this.lastPoint = coords;
  }

  /**
   * 移动绘图
   */
  moveDrawing(coords: { x: number; y: number }, existingPaths: DrawingPath[]): void {
    if (!this.enabled || !this.isDrawing) return;

    const lastPoint = this.lastPoint;
    if (lastPoint) {
      const dx = coords.x - lastPoint.x;
      const dy = coords.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1) {
        this.currentPath.push(coords);
        this.lastPoint = coords;
        this.redrawWithTempPath(existingPaths);
        this.callbacks.onDrawing?.();
      }
    }
  }

  /**
   * 结束绘图
   */
  endDrawing(existingPaths: DrawingPath[]): DrawingPath | null {
    if (!this.isDrawing) return null;

    this.isDrawing = false;

    let completedPath: DrawingPath | null = null;
    if (this.currentPath.length >= 2) {
      completedPath = {
        points: [...this.currentPath],
        color: this.penColor,
        lineWidth: this.penWidth,
      };
      this.callbacks.onPathComplete?.(completedPath);
    }

    this.currentPath = [];
    this.lastPoint = null;
    this.renderer.redraw(existingPaths);

    return completedPath;
  }

  /**
   * 重绘（包含临时路径）
   */
  private redrawWithTempPath(existingPaths: DrawingPath[]): void {
    this.renderer.redraw(existingPaths);
    if (this.currentPath.length >= 2) {
      this.renderer.drawTempPath(this.currentPath, this.penColor, this.penWidth);
    }
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.isDrawing = false;
    this.currentPath = [];
    this.lastPoint = null;
  }
}
