import type { DrawingPath } from '@/types';
import type { CellCoverageParams, GridConfig } from './types';

/**
 * 单元格覆盖率计算器
 * 职责：计算绘图路径对单元格的覆盖率，用于评估练字完成度
 * 单一职责：只负责覆盖率计算算法，不涉及状态管理
 */
export class CellCoverageCalculator {
  /** 单元格内边距比例（边缘留白） */
  private static readonly MARGIN_RATIO = 0.12;

  /** 九宫格划分数量 */
  private static readonly SECTORS = 9;

  /** 最小路径长度系数（相对于单元格大小） */
  private static readonly MIN_PATH_LENGTH_FACTOR = 1.5;

  /** 扇区覆盖率权重 */
  private static readonly SECTOR_COVERAGE_WEIGHT = 0.55;

  /** 路径长度覆盖率权重 */
  private static readonly PATH_LENGTH_WEIGHT = 0.45;

  /**
   * 计算单个单元格的覆盖率
   * @param params - 单元格参数和路径
   * @returns 覆盖率（0-1）
   */
  static calculateSingleCellCoverage(params: CellCoverageParams): number {
    const { cellX, cellY, cellSize, paths } = params;

    const margin = cellSize * CellCoverageCalculator.MARGIN_RATIO;
    const effectiveX = cellX + margin;
    const effectiveY = cellY + margin;
    const effectiveSize = cellSize - margin * 2;

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

    const sectorCoverage = coveredSectors.size / CellCoverageCalculator.SECTORS;
    const minPathLength = cellSize * CellCoverageCalculator.MIN_PATH_LENGTH_FACTOR;
    const pathLengthCoverage = Math.min(1, totalPathLength / minPathLength);

    const finalCoverage =
      sectorCoverage * CellCoverageCalculator.SECTOR_COVERAGE_WEIGHT +
      pathLengthCoverage * CellCoverageCalculator.PATH_LENGTH_WEIGHT;

    return Math.min(1, Math.max(0, finalCoverage));
  }

  /**
   * 批量计算网格中所有单元格的覆盖率
   * @param gridConfig - 网格配置
   * @param paths - 所有绘制路径
   * @param onCellComplete - 每个单元格计算完成后的回调
   */
  static calculateGridCoverage(
    gridConfig: GridConfig,
    paths: DrawingPath[],
    onCellComplete: (row: number, col: number, coverage: number) => void
  ): void {
    const { cols, rows, cellSize, lineNumberWidth = 0 } = gridConfig;
    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = lineNumberWidth + col * cellSize;
        const cellY = row * cellSize;

        if (cellX >= gridWidth + lineNumberWidth || cellY >= gridHeight) continue;

        const coverage = CellCoverageCalculator.calculateSingleCellCoverage({
          cellX,
          cellY,
          cellSize,
          paths,
        });

        onCellComplete(row, col, coverage);
      }
    }
  }
}
