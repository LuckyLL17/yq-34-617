import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { DrawingPath } from '@/types';

const EMPTY_ARRAY: DrawingPath[] = [];
const LINE_NUMBER_WIDTH = 28;

interface PageDrawingCanvasProps {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
}

export interface PageDrawingCanvasHandle {
  redraw: () => void;
}

const PageDrawingCanvas = forwardRef<PageDrawingCanvasHandle, PageDrawingCanvasProps>(
  function PageDrawingCanvas({ pageIndex, pageWidth, pageHeight }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    const { pagePaths, penColor, penWidth, drawingEnabled, addPathToPage, cellSize, colsPerRow, rows, showLineNumbers, setCellCompletion } = useCopybookStore(
      useShallow((s) => ({
        pagePaths: s.pagePaths[pageIndex] ?? EMPTY_ARRAY,
        penColor: s.penColor,
        penWidth: s.penWidth,
        drawingEnabled: s.drawingEnabled,
        addPathToPage: s.addPathToPage,
        cellSize: s.cellSize,
        colsPerRow: s.colsPerRow,
        rows: s.rows,
        showLineNumbers: s.showLineNumbers,
        setCellCompletion: s.setCellCompletion,
      }))
    );

    const lineNumberWidth = showLineNumbers ? LINE_NUMBER_WIDTH : 0;

    const calculateCellCoverage = useCallback(
      (allPaths: DrawingPath[]) => {
        if (!drawingEnabled || allPaths.length === 0) return;

        const gridWidth = colsPerRow * cellSize;
        const gridHeight = rows * cellSize;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < colsPerRow; col++) {
            const cellX = lineNumberWidth + col * cellSize;
            const cellY = row * cellSize;

            if (cellX >= gridWidth + lineNumberWidth || cellY >= gridHeight) continue;

            const cellKey = `${row}-${col}`;
            const coverage = calculateSingleCellCoverage(cellX, cellY, cellSize, allPaths);
            setCellCompletion(pageIndex, cellKey, coverage);
          }
        }
      },
      [drawingEnabled, colsPerRow, rows, cellSize, lineNumberWidth, setCellCompletion, pageIndex]
    );

    const getCanvasCoords = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        let clientX: number, clientY: number;
        const nativeEvent = e.nativeEvent;
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
      },
      []
    );

    const drawPath = useCallback(
      (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
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
      },
      []
    );

    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      for (const path of pagePaths) {
        drawPath(ctx, path);
      }
    }, [pagePaths, drawPath]);

    const drawCurrentPath = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || currentPathRef.current.length < 2) return;

      drawPath(ctx, {
        points: currentPathRef.current,
        color: penColor,
        lineWidth: penWidth,
      });
    }, [penColor, penWidth, drawPath]);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!drawingEnabled) return;
        e.preventDefault();

        const coords = getCanvasCoords(e);
        if (!coords) return;

        isDrawingRef.current = true;
        currentPathRef.current = [coords];
        lastPointRef.current = coords;
      },
      [drawingEnabled, getCanvasCoords]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!drawingEnabled || !isDrawingRef.current) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        let clientX: number, clientY: number;
        if ('touches' in e && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
          clientX = e.clientX;
          clientY = e.clientY;
        } else {
          return;
        }

        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          return;
        }

        const coords = {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };

        const lastPoint = lastPointRef.current;
        if (lastPoint) {
          const dx = coords.x - lastPoint.x;
          const dy = coords.y - lastPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 1) {
            currentPathRef.current.push(coords);
            lastPointRef.current = coords;
            redrawCanvas();
            drawCurrentPath();
          }
        }
      },
      [drawingEnabled, redrawCanvas, drawCurrentPath]
    );

    const handleMouseUp = useCallback(() => {
      if (!isDrawingRef.current) return;

      isDrawingRef.current = false;

      if (currentPathRef.current.length >= 2) {
        const path: DrawingPath = {
          points: [...currentPathRef.current],
          color: penColor,
          lineWidth: penWidth,
        };
        addPathToPage(pageIndex, path);
      }

      currentPathRef.current = [];
      lastPointRef.current = null;
      redrawCanvas();
    }, [penColor, penWidth, pageIndex, addPathToPage, redrawCanvas]);

    useImperativeHandle(ref, () => ({
      redraw: redrawCanvas,
    }));

    useEffect(() => {
      const handleGlobalMouseUp = () => handleMouseUp();
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDrawingRef.current) {
          handleMouseMove(e);
        }
      };
      const handleGlobalTouchMove = (e: TouchEvent) => {
        if (isDrawingRef.current) {
          handleMouseMove(e);
        }
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
      window.addEventListener('touchcancel', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });

      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('touchend', handleGlobalMouseUp);
        window.removeEventListener('touchcancel', handleGlobalMouseUp);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
      };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = pageWidth * dpr;
      canvas.height = pageHeight * dpr;
      canvas.style.width = `${pageWidth}px`;
      canvas.style.height = `${pageHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      redrawCanvas();
    }, [pageWidth, pageHeight, redrawCanvas]);

    useEffect(() => {
      redrawCanvas();
    }, [redrawCanvas]);

    useEffect(() => {
      if (drawingEnabled) {
        calculateCellCoverage(pagePaths);
      }
    }, [pagePaths, drawingEnabled, calculateCellCoverage]);

    useEffect(() => {
      if (!drawingEnabled) {
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < colsPerRow; col++) {
            const cellKey = `${row}-${col}`;
            setCellCompletion(pageIndex, cellKey, 0);
          }
        }
      }
    }, [drawingEnabled, pageIndex, rows, colsPerRow, setCellCompletion]);

    const handleCanvasMouseUp = useCallback(() => {
      handleMouseUp();
    }, [handleMouseUp]);

    return (
      <canvas
        ref={canvasRef}
        className={`page-drawing-canvas absolute inset-0 z-10 ${
          drawingEnabled ? 'cursor-crosshair' : 'pointer-events-none'
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={handleMouseDown}
      />
    );
  }
);

function calculateSingleCellCoverage(
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
  const cellPaths: DrawingPath[] = [];

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
      cellPaths.push({ ...path, points: cellPoints });

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

export default PageDrawingCanvas;
