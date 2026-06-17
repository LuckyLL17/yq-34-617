import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDrawingStore, useConfigStore } from '@/store';
import { CanvasRenderer, DrawingEngine, CellCoverageCalculator } from '@/engine/canvas';
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
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const drawingEngineRef = useRef<DrawingEngine | null>(null);

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

    const { cellSize, colsPerRow, rows, showLineNumbers } = useConfigStore(
      useShallow((s) => ({
        cellSize: s.cellSize,
        colsPerRow: s.colsPerRow,
        rows: s.rows,
        showLineNumbers: s.showLineNumbers,
      }))
    );

    const lineNumberWidth = showLineNumbers ? LINE_NUMBER_WIDTH : 0;

    const calculateCellCoverage = useCallback(
      (allPaths: DrawingPath[]) => {
        if (!drawingEnabled || allPaths.length === 0) return;

        const coverageMap = CellCoverageCalculator.calculateGrid(
          colsPerRow,
          rows,
          cellSize,
          allPaths,
          lineNumberWidth
        );

        for (const [cellKey, coverage] of Object.entries(coverageMap)) {
          setCellCompletion(pageIndex, cellKey, coverage);
        }
      },
      [drawingEnabled, colsPerRow, rows, cellSize, lineNumberWidth, setCellCompletion, pageIndex]
    );

    const redrawCanvas = useCallback(() => {
      if (rendererRef.current) {
        rendererRef.current.redraw(pagePaths);
      }
    }, [pagePaths]);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!drawingEnabled || !drawingEngineRef.current) return;
        e.preventDefault();

        const coords = drawingEngineRef.current.getCoordsFromEvent(e);
        if (!coords) return;

        drawingEngineRef.current.startDrawing(coords);
      },
      [drawingEnabled]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!drawingEngineRef.current) return;
        if (!drawingEnabled || !drawingEngineRef.current.isDrawingActive()) return;
        e.preventDefault();

        const coords = drawingEngineRef.current.getCoordsFromNativeEvent(e);
        if (!coords) return;

        drawingEngineRef.current.moveDrawing(coords, pagePaths);
      },
      [drawingEnabled, pagePaths]
    );

    const handleMouseUp = useCallback(() => {
      if (!drawingEngineRef.current) return;

      const completedPath = drawingEngineRef.current.endDrawing(pagePaths);
      if (completedPath) {
        addPathToPage(pageIndex, completedPath);
      }
    }, [pageIndex, addPathToPage, pagePaths]);

    useImperativeHandle(ref, () => ({
      redraw: redrawCanvas,
    }));

    useEffect(() => {
      const handleGlobalMouseUp = () => handleMouseUp();
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (drawingEngineRef.current?.isDrawingActive()) {
          handleMouseMove(e);
        }
      };
      const handleGlobalTouchMove = (e: TouchEvent) => {
        if (drawingEngineRef.current?.isDrawingActive()) {
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

      const renderer = new CanvasRenderer(canvas);
      renderer.resize(pageWidth, pageHeight);
      rendererRef.current = renderer;

      const engine = new DrawingEngine(renderer);
      engine.setPenColor(penColor);
      engine.setPenWidth(penWidth);
      engine.setEnabled(drawingEnabled);
      drawingEngineRef.current = engine;

      renderer.redraw(pagePaths);

      return () => {
        engine.destroy();
        rendererRef.current = null;
        drawingEngineRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (rendererRef.current) {
        rendererRef.current.resize(pageWidth, pageHeight);
        rendererRef.current.redraw(pagePaths);
      }
    }, [pageWidth, pageHeight, pagePaths]);

    useEffect(() => {
      if (drawingEngineRef.current) {
        drawingEngineRef.current.setPenColor(penColor);
        drawingEngineRef.current.setPenWidth(penWidth);
        drawingEngineRef.current.setEnabled(drawingEnabled);
      }
    }, [penColor, penWidth, drawingEnabled]);

    useEffect(() => {
      if (rendererRef.current) {
        rendererRef.current.redraw(pagePaths);
      }
    }, [pagePaths]);

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

export default PageDrawingCanvas;
