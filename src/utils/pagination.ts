export type PaperSize = 'a4' | 'a5' | 'letter' | 'legal';
export type PageOrientation = 'portrait' | 'landscape';
export type ExportFormat = 'pdf' | 'png' | 'jpg';
export type ImageQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface ImageLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaperDimensions {
  width: number;
  height: number;
}

export interface ExportOptions {
  filename?: string;
  scale?: number;
  marginMm?: number;
  includeDrawing?: boolean;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
  format?: ExportFormat;
  imageQuality?: ImageQuality;
  pageRange?: 'all' | 'current' | [number, number];
  currentPageIndex?: number;
}

export interface BatchExportOptions extends ExportOptions {
  progressCallback?: (current: number, total: number) => void;
}

const PAPER_SIZES_MM: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
};

const QUALITY_SCALE: Record<ImageQuality, number> = {
  low: 1,
  medium: 2,
  high: 3,
  ultra: 4,
};

const JPEG_QUALITY: Record<ImageQuality, number> = {
  low: 0.7,
  medium: 0.85,
  high: 0.95,
  ultra: 0.98,
};

function getPaperDimensions(
  paperSize: PaperSize,
  orientation: PageOrientation
): PaperDimensions {
  const size = PAPER_SIZES_MM[paperSize];
  if (orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }
  return size;
}

function calculateImageLayout(
  imageWidth: number,
  imageHeight: number,
  pageWidthMm: number,
  pageHeightMm: number,
  marginMm: number
): ImageLayout {
  const drawWidthMm = pageWidthMm - marginMm * 2;
  const drawHeightMm = pageHeightMm - marginMm * 2;

  const imgRatio = imageWidth / imageHeight;
  const pageRatio = drawWidthMm / drawHeightMm;

  let width: number, height: number, x: number, y: number;

  if (imgRatio > pageRatio) {
    width = drawWidthMm;
    height = drawWidthMm / imgRatio;
    x = marginMm;
    y = marginMm + (drawHeightMm - height) / 2;
  } else {
    height = drawHeightMm;
    width = drawHeightMm * imgRatio;
    x = marginMm + (drawWidthMm - width) / 2;
    y = marginMm;
  }

  return { x, y, width, height };
}

function filterPageElements(
  pageElements: HTMLElement[],
  pageRange: ExportOptions['pageRange'],
  currentPageIndex: number
): HTMLElement[] {
  if (pageRange === 'all' || !pageRange) {
    return pageElements;
  }
  if (pageRange === 'current') {
    const page = pageElements.find(
      (el) => Number(el.getAttribute('data-page-index')) === currentPageIndex
    );
    return page ? [page] : pageElements.slice(0, 1);
  }
  if (Array.isArray(pageRange)) {
    const [start, end] = pageRange;
    return pageElements.filter((el) => {
      const idx = Number(el.getAttribute('data-page-index'));
      return idx >= start && idx <= end;
    });
  }
  return pageElements;
}

function getPageElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-page-index]')
  ).sort(
    (a, b) =>
      Number(a.getAttribute('data-page-index')) -
      Number(b.getAttribute('data-page-index'))
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '字帖';
}

function getQualityScale(quality: ImageQuality): number {
  return QUALITY_SCALE[quality];
}

function getJpegQuality(quality: ImageQuality): number {
  return JPEG_QUALITY[quality];
}

export {
  getPaperDimensions,
  calculateImageLayout,
  filterPageElements,
  getPageElements,
  sanitizeFilename,
  getQualityScale,
  getJpegQuality,
};
