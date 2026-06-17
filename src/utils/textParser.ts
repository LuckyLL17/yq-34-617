import type { WritingDirection } from '@/types';

export const PAGE_BREAK = '---';
export const LINE_BREAK = '|';

export interface ParsedText {
  pages: string[][][];
  totalChars: number;
}

export function isPageBreakToken(token: string): boolean {
  return token === PAGE_BREAK;
}

export function isLineBreakToken(token: string): boolean {
  return token === LINE_BREAK;
}

function isVerticalDirection(direction: WritingDirection): boolean {
  return direction === 'vertical-rtl' || direction === 'vertical-ltr';
}

export function tokenizeText(text: string): string[] {
  const tokens: string[] = [];
  const chars = Array.from(text);

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === '-' && i + 2 < chars.length && chars[i + 1] === '-' && chars[i + 2] === '-') {
      tokens.push(PAGE_BREAK);
      i += 2;
      continue;
    }
    if (chars[i] === LINE_BREAK) {
      tokens.push(LINE_BREAK);
      continue;
    }
    if (chars[i] === '\n' || chars[i] === '\r' || chars[i] === '\t' || chars[i] === ' ') {
      continue;
    }
    tokens.push(chars[i]);
  }

  return tokens;
}

export function parseTextToPages(
  text: string,
  colsPerRow: number,
  rows: number,
  writingDirection: WritingDirection = 'horizontal-ltr'
): ParsedText {
  const tokens = tokenizeText(text);
  const pages: string[][][] = [];
  let totalChars = 0;

  const vertical = isVerticalDirection(writingDirection);
  const primaryCount = vertical ? rows : colsPerRow;
  const secondaryCount = vertical ? colsPerRow : rows;

  let currentPage: string[][] = [];
  let currentPrimary: string[] = [];

  const flushPrimary = () => {
    while (currentPrimary.length < primaryCount) {
      currentPrimary.push(' ');
    }
    currentPage.push(currentPrimary);
    currentPrimary = [];
  };

  const flushPage = () => {
    if (currentPrimary.length > 0) {
      flushPrimary();
    }
    while (currentPage.length < secondaryCount) {
      const emptyLine: string[] = [];
      for (let i = 0; i < primaryCount; i++) {
        emptyLine.push(' ');
      }
      currentPage.push(emptyLine);
    }

    let finalPage = currentPage;

    if (writingDirection === 'horizontal-rtl') {
      finalPage = currentPage.map(row => [...row].reverse());
    } else if (writingDirection === 'vertical-rtl') {
      finalPage = [...currentPage].reverse();
    }

    if (vertical) {
      const transposed: string[][] = [];
      for (let i = 0; i < primaryCount; i++) {
        const newRow: string[] = [];
        for (let j = 0; j < secondaryCount; j++) {
          newRow.push(finalPage[j]?.[i] || ' ');
        }
        transposed.push(newRow);
      }
      finalPage = transposed;
    }

    pages.push(finalPage);
    currentPage = [];
  };

  for (const token of tokens) {
    if (isPageBreakToken(token)) {
      flushPage();
      continue;
    }

    if (isLineBreakToken(token)) {
      flushPrimary();
      if (currentPage.length >= secondaryCount) {
        flushPage();
      }
      continue;
    }

    if (currentPrimary.length >= primaryCount) {
      flushPrimary();
      if (currentPage.length >= secondaryCount) {
        flushPage();
      }
    }

    currentPrimary.push(token);
    totalChars++;
  }

  if (currentPrimary.length > 0 || currentPage.length > 0) {
    flushPage();
  }

  if (pages.length === 0) {
    const emptyPage: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const emptyRow: string[] = [];
      for (let c = 0; c < colsPerRow; c++) {
        emptyRow.push(' ');
      }
      emptyPage.push(emptyRow);
    }
    pages.push(emptyPage);
  }

  return { pages, totalChars };
}

export function countValidChars(text: string): number {
  const tokens = tokenizeText(text);
  let count = 0;
  for (const token of tokens) {
    if (!isPageBreakToken(token) && !isLineBreakToken(token)) {
      count++;
    }
  }
  return count;
}

export function extractContentChars(text: string): string[] {
  const tokens = tokenizeText(text);
  const chars: string[] = [];
  for (const token of tokens) {
    if (!isPageBreakToken(token) && !isLineBreakToken(token)) {
      chars.push(token);
    }
  }
  return chars;
}
