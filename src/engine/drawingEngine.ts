import type { DrawingPath } from '@/types';

/**
 * Canvas渲染引擎
 * 负责所有Canvas绑定的纯渲染逻辑，与React组件解耦
 */

/** 绘制单条路径到Canvas上下文 */
export function drawPath(ctx: CanvasRenderingContext2D, path: DrawingPath): void {
  if (path.points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.moveTo(path.points[0].x, path.points[0].y);
  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }
  ctx.stroke();
}

/** 清空Canvas画布 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

/** 重绘所有路径到Canvas */
export function redrawCanvas(canvas: HTMLCanvasElement, paths: DrawingPath[]): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  clearCanvas(canvas);

  for (const path of paths) {
    drawPath(ctx, path);
  }
}

/** 根据设备像素比设置Canvas尺寸 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}

/** 从鼠标/触摸事件中提取Canvas坐标 */
export function getEventCoords(
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();

  let clientX: number, clientY: number;
  const nativeEvent = 'nativeEvent' in e ? e.nativeEvent : e;

  if ('touches' in nativeEvent && nativeEvent.touches.length > 0) {
    clientX = nativeEvent.touches[0].clientX;
    clientY = nativeEvent.touches[0].clientY;
  } else if ('clientX' in nativeEvent) {
    clientX = nativeEvent.clientX;
    clientY = nativeEvent.clientY;
  } else {
    return null;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

/** 判断坐标是否在Canvas边界内 */
export function isInsideCanvas(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): boolean {
  const rect = canvas.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

/** 从原生鼠标/触摸事件提取坐标（非React合成事件） */
export function getNativeEventCoords(
  e: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();

  let clientX: number, clientY: number;
  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return null;
  }

  if (!isInsideCanvas(clientX, clientY, canvas)) return null;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

/** 计算单个单元格的书写覆盖率 */
export function calculateSingleCellCoverage(
  cellX: number,
  cellY: number,
  cellSize: number,
  paths: DrawingPath[]
): number {
  const margin = cellSize * 0.12;
  const effectiveX = cellX + margin;
  const effectiveY = cellY + margin;
  const effectiveSize = cellSize - margin * 2;

  const sectors = 9;
  const sectorSize = effectiveSize / 3;
  const coveredSectors = new Set<number>();

  let totalPathLength = 0;

  for (const path of paths) {
    const cellPoints: { x: number; y: number }[] = [];
    for (let i = 0; i < path.points.length; i++) {
      const p = path.points[i];
      if (
        p.x >= effectiveX &&
        p.x <= effectiveX + effectiveSize &&
        p.y >= effectiveY &&
        p.y <= effectiveY + effectiveSize
      ) {
        cellPoints.push(p);
      }
    }

    if (cellPoints.length >= 2) {
      let pathLen = 0;
      for (let i = 1; i < cellPoints.length; i++) {
        const dx = cellPoints[i].x - cellPoints[i - 1].x;
        const dy = cellPoints[i].y - cellPoints[i - 1].y;
        pathLen += Math.sqrt(dx * dx + dy * dy);
      }
      totalPathLength += pathLen;

      for (const p of cellPoints) {
        const relX = p.x - effectiveX;
        const relY = p.y - effectiveY;
        const col = Math.min(2, Math.floor(relX / sectorSize));
        const row = Math.min(2, Math.floor(relY / sectorSize));
        const sectorIdx = row * 3 + col;
        coveredSectors.add(sectorIdx);
      }
    }
  }

  if (coveredSectors.size === 0 && totalPathLength === 0) {
    return 0;
  }

  const sectorCoverage = coveredSectors.size / sectors;
  const minPathLength = cellSize * 1.5;
  const pathLengthCoverage = Math.min(1, totalPathLength / minPathLength);

  const finalCoverage = sectorCoverage * 0.55 + pathLengthCoverage * 0.45;
  return Math.min(1, Math.max(0, finalCoverage));
}

/** 计算整页所有单元格的书写覆盖率 */
export function calculateCellCoverage(
  paths: DrawingPath[],
  config: {
    colsPerRow: number;
    rows: number;
    cellSize: number;
    lineNumberWidth: number;
  }
): Record<string, number> {
  const result: Record<string, number> = {};
  const { colsPerRow, rows, cellSize, lineNumberWidth } = config;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < colsPerRow; col++) {
      const cellX = lineNumberWidth + col * cellSize;
      const cellY = row * cellSize;
      const cellKey = `${row}-${col}`;
      result[cellKey] = calculateSingleCellCoverage(cellX, cellY, cellSize, paths);
    }
  }

  return result;
}
