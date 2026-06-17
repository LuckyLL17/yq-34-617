import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import CopybookPreview from '@/components/Preview/CopybookPreview';
import type { CopybookConfig } from '@/types';
import type { ExportFormat, ImageQuality } from '@/utils/pagination';
import { getJpegQuality } from '@/utils/pagination';

/**
 * 捕获的页面数据
 */
export interface CapturedPage {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * 渲染后的页面元素
 */
export interface RenderedPages {
  container: HTMLElement;
  root: Root;
  pageElements: HTMLElement[];
}

/**
 * 页面捕获引擎
 * 职责：负责将字帖配置渲染为页面元素，并通过 html2canvas 捕获为 Canvas 图像
 * 单一职责：只处理页面渲染和图像捕获，不涉及业务状态
 */
export class PageCaptureEngine {
  /**
   * 等待字体加载完成
   */
  static async waitFontsReady(): Promise<void> {
    try {
      const doc = document as Document & {
        fonts?: {
          ready?: Promise<void>;
        };
      };
      if (doc.fonts && doc.fonts.ready) {
        await doc.fonts.ready;
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  /**
   * 创建临时容器（离屏渲染用）
   */
  static createTemporaryContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '-99999px';
    container.style.width = '1200px';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    document.body.appendChild(container);
    return container;
  }

  /**
   * 清理临时容器
   */
  static cleanupTemporaryContainer(container: HTMLElement, root?: Root): void {
    if (root) {
      root.unmount();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  /**
   * 将配置渲染为页面 DOM 元素
   * @param config - 字帖配置
   * @returns 渲染后的页面容器和元素
   */
  static async renderConfigToElements(config: CopybookConfig): Promise<RenderedPages> {
    const container = PageCaptureEngine.createTemporaryContainer();
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);
    const root = createRoot(wrapper);

    await new Promise<void>((resolve, reject) => {
      try {
        root.render(
          React.createElement(CopybookPreview, {
            overrideConfig: { ...config },
          })
        );
        setTimeout(resolve, 400);
      } catch (e) {
        reject(e);
      }
    });

    await PageCaptureEngine.waitFontsReady();

    const pageElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-page-index]')
    ).sort(
      (a, b) =>
        Number(a.getAttribute('data-page-index')) -
        Number(b.getAttribute('data-page-index'))
    );

    return { container, root, pageElements };
  }

  /**
   * 捕获单个页面元素为 Canvas
   * @param element - 页面 DOM 元素
   * @param scale - 缩放比例
   * @param includeDrawing - 是否包含绘图层
   * @param format - 导出格式
   * @param quality - 图像质量
   * @returns 捕获的页面数据
   */
  static async capturePage(
    element: HTMLElement,
    scale: number,
    includeDrawing: boolean,
    format: ExportFormat = 'pdf',
    quality: ImageQuality = 'high'
  ): Promise<CapturedPage> {
    const pageIndex = element.getAttribute('data-page-index');

    const originalDrawCanvases = includeDrawing
      ? Array.from(
          element.querySelectorAll<HTMLCanvasElement>('canvas.page-drawing-canvas')
        )
      : [];

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowWidth: element.scrollWidth + 100,
      windowHeight: element.scrollHeight + 100,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      onclone: (clonedDoc) => {
        const clone = clonedDoc.body.querySelector(
          `[data-page-index="${pageIndex}"]`
        ) as HTMLElement | null;
        if (clone) {
          clone.style.transform = 'none';
          clone.style.filter = 'none';
          clone.style.margin = '0';
        }

        const clonedDrawCanvases = clonedDoc.querySelectorAll<HTMLCanvasElement>(
          'canvas.page-drawing-canvas'
        );

        if (!includeDrawing) {
          clonedDrawCanvases.forEach((c) => c.remove());
        } else {
          clonedDrawCanvases.forEach((clonedCanvas, idx) => {
            const srcCanvas = originalDrawCanvases[idx];
            if (!srcCanvas || srcCanvas.width === 0 || srcCanvas.height === 0) return;

            clonedCanvas.width = srcCanvas.width;
            clonedCanvas.height = srcCanvas.height;

            const ctx = clonedCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(srcCanvas, 0, 0);
            }
          });
        }

        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((s) => s.removeAttribute('media'));
      },
    });

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const jpegQuality = getJpegQuality(quality);

    return {
      canvas,
      dataUrl: canvas.toDataURL(mimeType, jpegQuality),
      width: canvas.width,
      height: canvas.height,
    };
  }

  /**
   * 批量捕获多个页面
   * @param pageElements - 页面元素数组
   * @param scale - 缩放比例
   * @param includeDrawing - 是否包含绘图层
   * @param format - 导出格式
   * @param quality - 图像质量
   * @returns 捕获的页面数据数组
   */
  static async capturePages(
    pageElements: HTMLElement[],
    scale: number,
    includeDrawing: boolean,
    format: ExportFormat = 'pdf',
    quality: ImageQuality = 'high'
  ): Promise<CapturedPage[]> {
    const results: CapturedPage[] = [];
    for (const el of pageElements) {
      const captured = await PageCaptureEngine.capturePage(
        el,
        scale,
        includeDrawing,
        format,
        quality
      );
      results.push(captured);
    }
    return results;
  }
}
