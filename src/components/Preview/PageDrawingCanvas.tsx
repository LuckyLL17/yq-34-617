import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDrawingStore } from '@/store/useDrawingStore';
import { useCopybookConfigStore } from '@/store/useCopybookConfigStore';
import {
  redrawCanvas,
  setupCanvas,
  getEventCoords,
  getNativeEventCoords,
  calculateCellCoverage,
  drawPath,
} from '@/engine/drawingEngine';
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
    const lastPointRef = useRef<{ x: number; y: number } | null>( null);

    const { pagePaths, penColor, penWidth, drawingEnabled, addPathToPage, setCellCompletion } =
      useDrawingStore(
        useShallow((s) => ({
          pagePaths: s.pagePaths[pageIndex] ?? EMPTY_ARRAY,
          penColor: s.penColor,
          penWidth: s.penWidth,
          drawingEnabled: s.drawingEnabled,
          addPathToPage: s.addPathToPage,
          setCellCompletion: s.setCellCompletion,
        }))
      );

    const { cellSize, colsPerRow, rows, showLineNumbers } = useCopybookConfigStore(
      useShallow((s) => ({
        cellSize: s.cellSize,
        colsPerRow: s.colsPerRow,
        rows: s.rows,
        showLineNumbers: s.showLineNumbers,
      }))
    );

    const lineNumberWidth = showLineNumbers ? LINE_NUMBER_WIDTH : 0;

    const handleCalculateCellCoverage = useCallback(
      (allPaths: DrawingPath[]) => {
        if (!drawingEnabled || allPaths.length === 0) return;

        const coverageMap = calculateCellCoverage(allPaths, {
          colsPerRow,
          rows,
          cellSize,
          lineNumberWidth,
        });

        for (const [cellKey, coverage] of Object.entries(coverageMap)) {
          setCellCompletion(pageIndex, cellKey, coverage);
        }
      },
      [drawingEnabled, colsPerRow, rows, cellSize, lineNumberWidth, setCellCompletion, pageIndex]
    );

    const handleRedrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      redrawCanvas(canvas, pagePaths);
    }, [pagePaths]);

    const drawCurrentPath = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || currentPathRef.current.length < 2) return;

      drawPath(ctx, {
        points: currentPathRef.current,
        color: penColor,
        lineWidth: penWidth,
      });
    }, [penColor, penWidth]);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!drawingEnabled) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const coords = getEventCoords(e, canvas);
        if (!coords) return;

        isDrawingRef.current = true;
        currentPathRef.current = [coords];
        lastPointRef.current = coords;
      },
      [drawingEnabled]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!drawingEnabled || !isDrawingRef.current) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const coords = getNativeEventCoords(e, canvas);
        if (!coords) return;

        const lastPoint = lastPointRef.current;
        if (lastPoint) {
          const dx = coords.x - lastPoint.x;
          const dy = coords.y - lastPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 1) {
            currentPathRef.current.push(coords);
            lastPointRef.current = coords;
            handleRedrawCanvas();
            drawCurrentPath();
          }
        }
      },
      [drawingEnabled, handleRedrawCanvas, drawCurrentPath]
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
      handleRedrawCanvas();
    }, [penColor, penWidth, pageIndex, addPathToPage, handleRedrawCanvas]);

    useImperativeHandle(ref, () => ({
      redraw: handleRedrawCanvas,
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

      setupCanvas(canvas, pageWidth, pageHeight);
      handleRedrawCanvas();
    }, [pageWidth, pageHeight, handleRedrawCanvas]);

    useEffect(() => {
      handleRedrawCanvas();
    }, [handleRedrawCanvas]);

    useEffect(() => {
      if (drawingEnabled) {
        handleCalculateCellCoverage(pagePaths);
      }
    }, [pagePaths, drawingEnabled, handleCalculateCellCoverage]);

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

export default PageDrawingCanvas;
