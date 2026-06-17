import jsPDF from 'jspdf';
import type { PaperSize, PageOrientation, ImageLayout } from './pagination';
import { getPaperDimensions, calculateImageLayout } from './pagination';
import type { CapturedPage } from './canvasGenerator';

export interface PdfConfig {
  paperSize?: PaperSize;
  orientation?: PageOrientation;
  marginMm?: number;
}

function createPdf(config: PdfConfig = {}): jsPDF {
  const { paperSize = 'a4', orientation = 'portrait', marginMm = 8 } = config;

  return new jsPDF({
    orientation,
    unit: 'mm',
    format: paperSize,
    compress: true,
  });
}

function addImageToPdf(
  pdf: jsPDF,
  capturedPage: CapturedPage,
  config: PdfConfig & { isFirstPage?: boolean } = {}
): void {
  const { paperSize = 'a4', orientation = 'portrait', marginMm = 8, isFirstPage = false } = config;

  const { width: pageWidthMm, height: pageHeightMm } = getPaperDimensions(paperSize, orientation);
  const layout: ImageLayout = calculateImageLayout(
    capturedPage.width,
    capturedPage.height,
    pageWidthMm,
    pageHeightMm,
    marginMm
  );

  if (!isFirstPage) {
    pdf.addPage(paperSize, orientation);
  }

  pdf.addImage(
    capturedPage.dataUrl,
    'JPEG',
    layout.x,
    layout.y,
    layout.width,
    layout.height,
    undefined,
    'FAST'
  );
}

function addCapturedPagesToPdf(
  pdf: jsPDF,
  capturedPages: CapturedPage[],
  config: PdfConfig = {}
): void {
  capturedPages.forEach((page, index) => {
    addImageToPdf(pdf, page, {
      ...config,
      isFirstPage: index === 0 && pdf.internal.pages.length === 1,
    });
  });
}

function addImageToExistingPdf(
  pdf: jsPDF,
  capturedPage: CapturedPage,
  marginMm: number,
  isFirstPage: boolean
): void {
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();

  const layout: ImageLayout = calculateImageLayout(
    capturedPage.width,
    capturedPage.height,
    pageWidthMm,
    pageHeightMm,
    marginMm
  );

  if (!isFirstPage) {
    pdf.addPage('a4', 'p');
  }

  pdf.addImage(
    capturedPage.dataUrl,
    'JPEG',
    layout.x,
    layout.y,
    layout.width,
    layout.height,
    undefined,
    'FAST'
  );
}

function savePdf(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}

function downloadImages(
  capturedPages: CapturedPage[],
  format: 'png' | 'jpg',
  baseFilename: string,
  pageIndices?: number[]
): void {
  capturedPages.forEach((page, index) => {
    const link = document.createElement('a');
    const pageIndex = pageIndices ? pageIndices[index] : index;
    const suffix = capturedPages.length > 1 ? `_第${pageIndex + 1}页` : '';
    link.download = `${baseFilename}${suffix}.${format}`;
    link.href = page.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

export {
  createPdf,
  addImageToPdf,
  addCapturedPagesToPdf,
  addImageToExistingPdf,
  savePdf,
  downloadImages,
};
