/**
 * Canvas 生成器（已重构，转发至 PageCaptureEngine）
 * @deprecated 请直接使用 @/engines/canvas 中的 PageCaptureEngine
 */

import {
  PageCaptureEngine,
  type CapturedPage,
  type RenderedPages,
} from '@/engines/canvas';
import type { CopybookConfig } from '@/types';
import type { ExportFormat, ImageQuality } from './pagination';

export type { CapturedPage, RenderedPages };

/**
 * @deprecated 使用 PageCaptureEngine.waitFontsReady 替代
 */
async function waitFontsReady(): Promise<void> {
  return PageCaptureEngine.waitFontsReady();
}

/**
 * @deprecated 使用 PageCaptureEngine.capturePage 替代
 */
async function capturePage(
  element: HTMLElement,
  scale: number,
  includeDrawing: boolean,
  format: ExportFormat = 'pdf',
  quality: ImageQuality = 'high'
): Promise<CapturedPage> {
  return PageCaptureEngine.capturePage(element, scale, includeDrawing, format, quality);
}

/**
 * @deprecated 使用 PageCaptureEngine.capturePages 替代
 */
async function capturePages(
  pageElements: HTMLElement[],
  scale: number,
  includeDrawing: boolean,
  format: ExportFormat = 'pdf',
  quality: ImageQuality = 'high'
): Promise<CapturedPage[]> {
  return PageCaptureEngine.capturePages(pageElements, scale, includeDrawing, format, quality);
}

/**
 * @deprecated 使用 PageCaptureEngine.createTemporaryContainer 替代
 */
function createTemporaryContainer(): HTMLElement {
  return PageCaptureEngine.createTemporaryContainer();
}

/**
 * @deprecated 使用 PageCaptureEngine.cleanupTemporaryContainer 替代
 */
function cleanupTemporaryContainer(container: HTMLElement, root?: any): void {
  return PageCaptureEngine.cleanupTemporaryContainer(container, root);
}

/**
 * @deprecated 使用 PageCaptureEngine.renderConfigToElements 替代
 */
async function renderConfigToElements(config: CopybookConfig): Promise<RenderedPages> {
  return PageCaptureEngine.renderConfigToElements(config);
}

export {
  waitFontsReady,
  capturePage,
  capturePages,
  createTemporaryContainer,
  cleanupTemporaryContainer,
  renderConfigToElements,
};
