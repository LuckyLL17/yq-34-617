import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDrawingStore } from '@/store/useDrawingStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useCopybookConfigStore } from '@/store/useCopybookConfigStore';
import { DrawingCanvasEngine, CellCoverageCalculator } from '@/engines/canvas';
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

/**
 * 页面绘图 Canvas 组件
 * 使用 DrawingCanvasEngine 处理渲染，CellCoverageCalculator 处理覆盖率计算
 */
const PageDrawingCanvas = forwardRef<PageDrawingCanvasHandle, PageDrawingCanvasProps>(
  function PageDrawingCanvas({ pageIndex, pageWidth, pageHeight }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<DrawingCanvasEngine | null>(null);
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    const { pagePaths, penColor, penWidth, drawingEnabled, addPathToPage } = useDrawingStore(
      useShallow((s) => ({
        pagePaths: s.pagePaths[pageIndex] ?? EMPTY_ARRAY,
        penColor: s.penColor,
        penWidth: s.penWidth,
        drawingEnabled: s.drawingEnabled,
        addPathToPage: s.addPathToPage,
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

    const { setCellCompletion } = useProgressStore(
      useShallow((s) => ({
        setCellCompletion: s.setCellCompletion,
      }))
    );

    const lineNumberWidth = showLineNumbers ? LINE_NUMBER_WIDTH : 0;

    /**
     * 计算页面所有单元格的覆盖率
     */
    const calculateCellCoverage = useCallback(
      (allPaths: DrawingPath[]) => {
        if (!drawingEnabled || allPaths.length === 0) return;

        CellCoverageCalculator.calculateGridCoverage(
          {
            cols: colsPerRow,
            rows: rows,
            cellSize: cellSize,
            lineNumberWidth,
          },
          allPaths,
          (row, col, coverage) => {
            const cellKey = `${row}-${col}`;
            setCellCompletion(pageIndex, cellKey, coverage);
          }
        );
      },
      [drawingEnabled, colsPerRow, rows, cellSize, lineNumberWidth, setCellCompletion, pageIndex]
    );

    /**
     * 从事件中获取 Canvas 坐标
     */
    const getCanvasCoords = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const nativeEvent = e.nativeEvent;
        let clientX: number, clientY: number;

        if ('touches' in nativeEvent && nativeEvent.touches.length > 0) {
          clientX = nativeEvent.touches[0].clientX;
          clientY = nativeEvent.touches[0].clientY;
        } else if ('clientX' in nativeEvent) {
          clientX = nativeEvent.clientX;
          clientY = nativeEvent.clientY;
        } else {
          return null;
        }

        return engineRef.current?.getCanvasCoords(clientX, clientY) ?? null;
      },
      []
    );

    /**
     * 绘制当前临时路径
     */
    const drawCurrentPath = useCallback(() => {
      const engine = engineRef.current;
      if (!engine || currentPathRef.current.length < 2) return;

      engine.drawTemporaryPath(currentPathRef.current, {
        color: penColor,
        lineWidth: penWidth,
      });
    }, [penColor, penWidth]);

    /**
     * 重绘整个 Canvas
     */
    const redrawCanvas = useCallback(() => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.redraw(pagePaths);
    }, [pagePaths]);

    /**
     * 开始绘制
     */
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

    /**
     * 绘制中（全局事件）
     */
    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!drawingEnabled || !isDrawingRef.current) return;
        e.preventDefault();

        const engine = engineRef.current;
        if (!engine) return;

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

        if (!engine.isPointInCanvas(clientX, clientY)) {
          return;
        }

        const coords = engine.getCanvasCoords(clientX, clientY);
        if (!coords) return;

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

    /**
     * 结束绘制
     */
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

    /**
     * 初始化 Canvas 引擎和全局事件监听
     */
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new DrawingCanvasEngine();
      engine.attach(canvas, pageWidth, pageHeight);
      engineRef.current = engine;

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
        engine.destroy();
      };
    }, [handleMouseMove, handleMouseUp]);

    /**
     * 监听尺寸变化，更新 Canvas 大小
     */
    useEffect(() => {
      const engine = engineRef.current;
      if (!engine) return;

      engine.resize(pageWidth, pageHeight);
      redrawCanvas();
    }, [pageWidth, pageHeight, redrawCanvas]);

    /**
     * 监听路径变化，重绘 Canvas
     */
    useEffect(() => {
      redrawCanvas();
    }, [redrawCanvas]);

    /**
     * 监听路径变化，计算覆盖率
     */
    useEffect(() => {
      if (drawingEnabled) {
        calculateCellCoverage(pagePaths);
      }
    }, [pagePaths, drawingEnabled, calculateCellCoverage]);

    /**
     * 绘图禁用时清空完成度
     */
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
