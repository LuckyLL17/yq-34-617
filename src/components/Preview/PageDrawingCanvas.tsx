import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDrawingStore } from '@/store/useDrawingStore';
import { useConfigStore } from '@/store/useConfigStore';
import { CanvasEngine, PathRenderer, CellCoverageCalculator } from '@/utils/canvas';
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
 * 页面绘图画布组件
 *
 * 职责：
 * - 管理 Canvas 元素的生命周期
 * - 处理用户绘图交互事件
 * - 协调绘图状态与 Canvas 渲染
 * - 计算单元格完成度
 *
 * 使用抽离的 Canvas 引擎处理渲染逻辑，
 * 组件本身只负责 React 生命周期和事件处理。
 */
const PageDrawingCanvas = forwardRef<PageDrawingCanvasHandle, PageDrawingCanvasProps>(
  function PageDrawingCanvas({ pageIndex, pageWidth, pageHeight }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    /** Canvas 引擎实例引用 */
    const canvasEngineRef = useRef<CanvasEngine | null>(null);
    /** 路径渲染器实例引用 */
    const pathRendererRef = useRef<PathRenderer | null>(null);

    /** 从绘图 store 获取状态和方法 */
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

    /** 从配置 store 获取状态 */
    const { cellSize, colsPerRow, rows, showLineNumbers } = useConfigStore(
      useShallow((s) => ({
        cellSize: s.cellSize,
        colsPerRow: s.colsPerRow,
        rows: s.rows,
        showLineNumbers: s.showLineNumbers,
      }))
    );

    const lineNumberWidth = useMemo(
      () => (showLineNumbers ? LINE_NUMBER_WIDTH : 0),
      [showLineNumbers]
    );

    /**
     * 初始化 Canvas 引擎和路径渲染器
     */
    const initCanvasEngine = useCallback(() => {
      if (!canvasRef.current) return;

      if (!canvasEngineRef.current) {
        canvasEngineRef.current = new CanvasEngine(canvasRef.current);
      } else {
        canvasEngineRef.current.attach(canvasRef.current);
      }

      if (!pathRendererRef.current) {
        pathRendererRef.current = new PathRenderer();
      }

      const ctx = canvasEngineRef.current.getContext();
      pathRendererRef.current.setContext(ctx);
    }, []);

    /**
     * 重绘画布
     * 清除画布并重绘所有路径
     */
    const redrawCanvas = useCallback(() => {
      const engine = canvasEngineRef.current;
      const renderer = pathRendererRef.current;
      if (!engine || !renderer) return;

      engine.clear();
      renderer.drawPaths(pagePaths);
    }, [pagePaths]);

    /**
     * 绘制当前正在绘制的路径
     */
    const drawCurrentPath = useCallback(() => {
      const renderer = pathRendererRef.current;
      if (!renderer || currentPathRef.current.length < 2) return;

      renderer.drawTempPath(currentPathRef.current, penColor, penWidth);
    }, [penColor, penWidth]);

    /**
     * 计算单元格覆盖率
     * 根据当前所有路径计算每个单元格的完成度
     */
    const calculateCellCoverage = useCallback(() => {
      if (!drawingEnabled || pagePaths.length === 0) return;

      const gridConfig = {
        cols: colsPerRow,
        rows: rows,
        cellSize,
      };

      const coverageMap = CellCoverageCalculator.calculateGridCoverage(
        gridConfig,
        pagePaths,
        lineNumberWidth
      );

      for (const [cellKey, coverage] of Object.entries(coverageMap)) {
        setCellCompletion(pageIndex, cellKey, coverage);
      }
    }, [drawingEnabled, colsPerRow, rows, cellSize, lineNumberWidth, setCellCompletion, pageIndex, pagePaths]);

    /**
     * 获取事件在 Canvas 中的坐标
     */
    const getCanvasCoords = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const engine = canvasEngineRef.current;
        if (!engine) return null;

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

        return engine.clientToCanvas(clientX, clientY);
      },
      []
    );

    /**
     * 处理鼠标/触摸按下事件
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
     * 处理鼠标/触摸移动事件
     */
    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        const engine = canvasEngineRef.current;
        if (!drawingEnabled || !isDrawingRef.current || !engine) return;
        e.preventDefault();

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

        const coords = engine.clientToCanvas(clientX, clientY);
        if (!coords) return;

        const lastPoint = lastPointRef.current;
        if (lastPoint) {
          const distance = PathRenderer.distance(lastPoint, coords);
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
     * 处理鼠标/触摸抬起事件
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

    /**
     * 暴露给父组件的方法
     */
    useImperativeHandle(ref, () => ({
      redraw: redrawCanvas,
    }));

    /**
     * 绑定全局事件监听器
     * 处理鼠标/触摸在画布外的移动和抬起
     */
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

    /**
     * 初始化 Canvas 引擎并调整尺寸
     */
    useEffect(() => {
      if (!canvasRef.current) return;

      initCanvasEngine();

      const dpr = window.devicePixelRatio || 1;
      canvasEngineRef.current?.resize({
        width: pageWidth,
        height: pageHeight,
        dpr,
      });

      const ctx = canvasEngineRef.current?.getContext();
      pathRendererRef.current?.setContext(ctx);

      redrawCanvas();
    }, [pageWidth, pageHeight, initCanvasEngine, redrawCanvas]);

    /**
     * 路径变化时重绘
     */
    useEffect(() => {
      redrawCanvas();
    }, [redrawCanvas]);

    /**
     * 路径变化时重新计算单元格覆盖率
     */
    useEffect(() => {
      if (drawingEnabled) {
        calculateCellCoverage();
      }
    }, [pagePaths, drawingEnabled, calculateCellCoverage]);

    /**
     * 绘图模式关闭时清空所有完成度
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
