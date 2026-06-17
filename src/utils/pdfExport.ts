import type { CopybookConfig, CopybookTemplate } from '@/types';
import type { CapturedPage } from './canvasGenerator';
import {
  waitFontsReady,
  capturePage,
  renderConfigToElements,
  cleanupTemporaryContainer,
} from './canvasGenerator';
import {
  createPdf,
  addImageToPdf,
  addImageToExistingPdf,
  savePdf,
  downloadImages,
} from './pdfAssembler';
import type {
  PaperSize,
  PageOrientation,
  ExportFormat,
  ImageQuality,
  ExportOptions,
  BatchExportOptions,
} from './pagination';
import {
  getPageElements,
  filterPageElements,
  getQualityScale,
  sanitizeFilename,
} from './pagination';

export type {
  PaperSize,
  PageOrientation,
  ExportFormat,
  ImageQuality,
  ExportOptions,
  BatchExportOptions,
};

async function captureFilteredPages(
  container: HTMLElement,
  options: ExportOptions
): Promise<{ pages: HTMLElement[]; pageIndices: number[] }> {
  const { pageRange = 'all', currentPageIndex = 0 } = options;

  const pageElements = getPageElements(container);

  if (pageElements.length === 0) {
    throw new Error('未找到字帖页面');
  }

  const filteredPages = filterPageElements(pageElements, pageRange, currentPageIndex);
  const pageIndices = filteredPages.map((el) => Number(el.getAttribute('data-page-index')));

  return { pages: filteredPages, pageIndices };
}

async function captureAndExportImages(
  pageElements: HTMLElement[],
  pageIndices: number[],
  options: ExportOptions
): Promise<void> {
  const {
    filename = '字帖',
    scale,
    includeDrawing = true,
    format = 'jpg',
    imageQuality = 'high',
  } = options;

  const actualScale = scale || getQualityScale(imageQuality);
  const safeFilename = sanitizeFilename(filename);
  const imgFormat = format === 'png' ? 'png' : 'jpg';

  const capturedPages: CapturedPage[] = [];

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];
    const captured = await capturePage(pageEl, actualScale, includeDrawing, format, imageQuality);
    capturedPages.push(captured);

    if (i < pageElements.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  downloadImages(capturedPages, imgFormat, safeFilename, pageIndices);
}

async function captureAndExportPdf(
  pageElements: HTMLElement[],
  options: ExportOptions
): Promise<void> {
  const {
    filename = '字帖',
    scale,
    marginMm = 8,
    includeDrawing = true,
    paperSize = 'a4',
    orientation = 'portrait',
    imageQuality = 'high',
  } = options;

  const actualScale = scale || getQualityScale(imageQuality);
  const safeFilename = sanitizeFilename(filename);

  const pdf = createPdf({ paperSize, orientation, marginMm });

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];
    const captured = await capturePage(pageEl, actualScale, includeDrawing, 'pdf', imageQuality);

    addImageToPdf(pdf, captured, {
      paperSize,
      orientation,
      marginMm,
      isFirstPage: i === 0,
    });
  }

  savePdf(pdf, `${safeFilename}.pdf`);
}

export async function exportCopybook(
  container: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  if (!container) {
    throw new Error('找不到要导出的元素');
  }

  const { format = 'pdf' } = options;

  await waitFontsReady();

  const { pages: filteredPages, pageIndices } = await captureFilteredPages(container, options);

  if (format === 'pdf') {
    await captureAndExportPdf(filteredPages, options);
  } else {
    await captureAndExportImages(filteredPages, pageIndices, options);
  }
}

export async function exportCopybookToPdf(
  container: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  return exportCopybook(container, { ...options, format: 'pdf' });
}

async function renderAndCaptureConfig(
  config: CopybookConfig,
  scale: number,
  marginMm: number,
  includeDrawing: boolean,
  pdf: ReturnType<typeof createPdf>,
  isFirstTemplate: boolean
): Promise<{ pagesAdded: number }> {
  const { container, root, pageElements } = await renderConfigToElements(config);

  let pagesAdded = 0;

  try {
    if (pageElements.length === 0) {
      throw new Error('未找到字帖页面');
    }

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const captured = await capturePage(pageEl, scale, includeDrawing);

      const isFirstPage = isFirstTemplate && i === 0;
      addImageToExistingPdf(pdf, captured, marginMm, isFirstPage);
      pagesAdded++;
    }

    return { pagesAdded };
  } finally {
    await new Promise((r) => setTimeout(r, 50));
    cleanupTemporaryContainer(container, root);
  }
}

export async function exportTemplatesToMergedPdf(
  templates: CopybookTemplate[],
  options: BatchExportOptions = {}
): Promise<void> {
  if (!templates || templates.length === 0) {
    throw new Error('请选择要导出的字帖模板');
  }

  const {
    filename = '字帖合集.pdf',
    scale = 2,
    marginMm = 8,
    includeDrawing = false,
    progressCallback,
  } = options;

  await waitFontsReady();

  const pdf = createPdf({
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm,
  });

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    if (progressCallback) {
      progressCallback(i + 1, templates.length);
    }
    await renderAndCaptureConfig(
      template.config,
      scale,
      marginMm,
      includeDrawing,
      pdf,
      i === 0
    );
  }

  savePdf(pdf, filename);
}

export async function exportTemplatesSeparately(
  templates: CopybookTemplate[],
  options: BatchExportOptions = {}
): Promise<void> {
  if (!templates || templates.length === 0) {
    throw new Error('请选择要导出的字帖模板');
  }

  const { scale = 2, marginMm = 8, includeDrawing = false, progressCallback } = options;

  await waitFontsReady();

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    if (progressCallback) {
      progressCallback(i + 1, templates.length);
    }

    const pdf = createPdf({
      paperSize: 'a4',
      orientation: 'portrait',
      marginMm,
    });

    await renderAndCaptureConfig(
      template.config,
      scale,
      marginMm,
      includeDrawing,
      pdf,
      true
    );

    const filename = `${sanitizeFilename(template.name)}.pdf`;
    savePdf(pdf, filename);

    if (i < templates.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}
