import type { DrawingPath } from '@/types';

/**
 * 单元格覆盖率计算器
 * 负责计算绘图路径对单个单元格的覆盖程度
 * 单一职责：仅处理覆盖率计算逻辑，与渲染和状态管理解耦
 */
export class CellCoverageCalculator {
  /**
   * 计算单个单元格的覆盖率
   * @param cellX 单元格 X 坐标
   * @param cellY 单元格 Y 坐标
   * @param cellSize 单元格大小
   * @param paths 绘图路径数组
   * @returns 覆盖率 0-1
   */
  static calculate(
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

  /**
   * 批量计算网格中所有单元格的覆盖率
   * @param cols 列数
   * @param rows 行数
   * @param cellSize 单元格大小
   * @param paths 绘图路径数组
   * @param offsetX X 偏移（如行号宽度）
   * @returns 单元格完成度映射 { [cellKey]: coverage }
   */
  static calculateGrid(
    cols: number,
    rows: number,
    cellSize: number,
    paths: DrawingPath[],
    offsetX: number = 0
  ): Record<string, number> {
    const result: Record<string, number> = {};
    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = offsetX + col * cellSize;
        const cellY = row * cellSize;

        if (cellX >= gridWidth + offsetX || cellY >= gridHeight) continue;

        const cellKey = `${row}-${col}`;
        result[cellKey] = CellCoverageCalculator.calculate(cellX, cellY, cellSize, paths);
      }
    }

    return result;
  }
}
