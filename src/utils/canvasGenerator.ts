import { PageCaptureEngine } from '@/engine/capture';
import type { CapturedPage, RenderedPages } from '@/engine/capture';

export type { CapturedPage, RenderedPages };

/**
 * 等待字体加载完成
 * @deprecated 请使用 PageCaptureEngine.waitFontsReady()
 */
async function waitFontsReady(): Promise<void> {
  return PageCaptureEngine.waitFontsReady();
}

/**
 * 捕获单个页面
 * @deprecated 请使用 PageCaptureEngine.capturePage()
 */
async function capturePage(
  element: HTMLElement,
  scale: number,
  includeDrawing: boolean,
  format: any = 'pdf',
  quality: any = 'high'
): Promise<CapturedPage> {
  return PageCaptureEngine.capturePage(element, scale, includeDrawing, format, quality);
}

/**
 * 批量捕获多个页面
 * @deprecated 请使用 PageCaptureEngine.capturePages()
 */
async function capturePages(
  pageElements: HTMLElement[],
  scale: number,
  includeDrawing: boolean,
  format: any = 'pdf',
  quality: any = 'high'
): Promise<CapturedPage[]> {
  return PageCaptureEngine.capturePages(pageElements, scale, includeDrawing, format, quality);
}

/**
 * 创建临时容器
 * @deprecated 请使用 PageCaptureEngine.createTemporaryContainer()
 */
function createTemporaryContainer(): HTMLElement {
  return PageCaptureEngine.createTemporaryContainer();
}

/**
 * 清理临时容器
 * @deprecated 请使用 PageCaptureEngine.cleanupTemporaryContainer()
 */
function cleanupTemporaryContainer(container: HTMLElement, root?: any): void {
  return PageCaptureEngine.cleanupTemporaryContainer(container, root);
}

/**
 * 将配置渲染为 DOM 元素
 * @deprecated 请使用 PageCaptureEngine.renderConfigToElements()
 */
async function renderConfigToElements(config: any): Promise<RenderedPages> {
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
