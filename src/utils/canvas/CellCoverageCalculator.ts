import type { DrawingPath } from '@/types';
import type { CellInfo } from './types';
import { PathRenderer } from './PathRenderer';

/**
 * 单元格覆盖率计算器
 * 负责计算绘图路径在单元格中的覆盖程度
 * 职责：根据路径数据计算每个单元格的完成度
 */
export class CellCoverageCalculator {
  /** 单元格内边距比例（相对于单元格大小） */
  private static readonly MARGIN_RATIO = 0.12;
  /** 扇形数量（用于判断覆盖范围） */
  private static readonly SECTORS = 9;
  /** 扇形权重 */
  private static readonly SECTOR_WEIGHT = 0.55;
  /** 路径长度权重 */
  private static readonly PATH_LENGTH_WEIGHT = 0.45;
  /** 最小路径长度系数（相对于单元格大小） */
  private static readonly MIN_PATH_LENGTH_FACTOR = 1.5;

  /**
   * 计算单个单元格的覆盖率
   * @param cell - 单元格信息
   * @param paths - 绘图路径数组
   * @returns 覆盖率（0-1）
   */
  static calculateCellCoverage(cell: CellInfo, paths: DrawingPath[]): number {
    const { x, y, size } = cell;

    const margin = size * this.MARGIN_RATIO;
    const effectiveX = x + margin;
    const effectiveY = y + margin;
    const effectiveSize = size - margin * 2;

    const sectorSize = effectiveSize / 3;
    const coveredSectors = new Set<number>();

    let totalPathLength = 0;
    const cellPaths: DrawingPath[] = [];

    for (const path of paths) {
      const cellPoints = this.extractCellPoints(path.points, effectiveX, effectiveY, effectiveSize);

      if (cellPoints.length >= 2) {
        const pathLen = PathRenderer.pathLength(cellPoints);
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

    const sectorCoverage = coveredSectors.size / this.SECTORS;
    const minPathLength = size * this.MIN_PATH_LENGTH_FACTOR;
    const pathLengthCoverage = Math.min(1, totalPathLength / minPathLength);

    const finalCoverage =
      sectorCoverage * this.SECTOR_WEIGHT + pathLengthCoverage * this.PATH_LENGTH_WEIGHT;
    return Math.min(1, Math.max(0, finalCoverage));
  }

  /**
   * 批量计算网格中所有单元格的覆盖率
   * @param gridConfig - 网格配置
   * @param paths - 绘图路径数组
   * @param lineNumberWidth - 行号宽度
   * @returns 单元格覆盖率映射 {cellKey: coverage}
   */
  static calculateGridCoverage(
    gridConfig: {
      cols: number;
      rows: number;
      cellSize: number;
    },
    paths: DrawingPath[],
    lineNumberWidth = 0
  ): Record<string, number> {
    const { cols, rows, cellSize } = gridConfig;
    const result: Record<string, number> = {};

    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = lineNumberWidth + col * cellSize;
        const cellY = row * cellSize;

        if (cellX >= gridWidth + lineNumberWidth || cellY >= gridHeight) continue;

        const cellKey = `${row}-${col}`;
        const coverage = this.calculateCellCoverage(
          { x: cellX, y: cellY, size: cellSize, row, col },
          paths
        );
        result[cellKey] = coverage;
      }
    }

    return result;
  }

  /**
   * 提取落在单元格内的路径点
   * @param points - 原始点数组
   * @param cellX - 单元格 X 坐标
   * @param cellY - 单元格 Y 坐标
   * @param cellSize - 单元格大小
   * @returns 落在单元格内的点数组
   */
  private static extractCellPoints(
    points: { x: number; y: number }[],
    cellX: number,
    cellY: number,
    cellSize: number
  ): { x: number; y: number }[] {
    const result: { x: number; y: number }[] = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (
        p.x >= cellX &&
        p.x <= cellX + cellSize &&
        p.y >= cellY &&
        p.y <= cellY + cellSize
      ) {
        result.push(p);
      }
    }

    return result;
  }
}
