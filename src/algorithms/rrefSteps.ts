import { Frac } from './fraction';
import type { FMatrix } from './matrix';
import type { RrefResult } from './rref';

export type StepType = 'init' | 'swap' | 'scale' | 'eliminate' | 'skip' | 'done';

export interface ElimStep {
  type: StepType;
  desc: string; // 人类可读说明（用 1-based 行号）
  matrix: FMatrix; // 该步执行后的矩阵快照
  activeRows: number[]; // 高亮行（0-based）
  pivot?: [number, number]; // 主元单元格 [row, col]
}

function snap(M: FMatrix): FMatrix {
  return M.map((r) => r.slice());
}
const R = (i: number) => `R${i + 1}`;

/**
 * 高斯-约旦消元，记录每一步（交换/归一/消去）的快照与说明，用于教学回放。
 * 最终结果与 rref() 完全一致。
 */
export function rrefSteps(matrix: FMatrix): { steps: ElimStep[]; result: RrefResult } {
  const M: FMatrix = snap(matrix);
  const nrows = M.length;
  const ncols = nrows === 0 ? 0 : M[0].length;
  const pivots: number[] = [];
  const steps: ElimStep[] = [
    { type: 'init', desc: '初始矩阵', matrix: snap(M), activeRows: [] },
  ];
  let r = 0;

  for (let c = 0; c < ncols && r < nrows; c++) {
    let pivotRow = -1;
    for (let i = r; i < nrows; i++) {
      if (!M[i][c].isZero()) {
        pivotRow = i;
        break;
      }
    }
    if (pivotRow === -1) {
      steps.push({
        type: 'skip',
        desc: `第 ${c + 1} 列在第 ${r + 1} 行及以下全为 0，跳过（该列对应自由变量）`,
        matrix: snap(M),
        activeRows: [],
      });
      continue;
    }

    if (pivotRow !== r) {
      [M[r], M[pivotRow]] = [M[pivotRow], M[r]];
      steps.push({
        type: 'swap',
        desc: `${R(r)} ↔ ${R(pivotRow)}：把第 ${c + 1} 列的非零元换到主元位置`,
        matrix: snap(M),
        activeRows: [r, pivotRow],
        pivot: [r, c],
      });
    }

    const pivotVal = M[r][c];
    if (!pivotVal.eq(Frac.ONE)) {
      M[r] = M[r].map((x) => x.div(pivotVal));
      steps.push({
        type: 'scale',
        desc: `${R(r)} ← ${R(r)} ÷ ${pivotVal.toString()}：主元归一为 1`,
        matrix: snap(M),
        activeRows: [r],
        pivot: [r, c],
      });
    }

    for (let i = 0; i < nrows; i++) {
      if (i !== r && !M[i][c].isZero()) {
        const factor = M[i][c];
        M[i] = M[i].map((x, k) => x.sub(factor.mul(M[r][k])));
        steps.push({
          type: 'eliminate',
          desc: `${R(i)} ← ${R(i)} − (${factor.toString()})·${R(r)}：消去第 ${c + 1} 列`,
          matrix: snap(M),
          activeRows: [i, r],
          pivot: [r, c],
        });
      }
    }

    pivots.push(c);
    r++;
  }

  steps.push({ type: 'done', desc: '已化为行最简形（RREF）', matrix: snap(M), activeRows: [] });
  return { steps, result: { R: M, pivots, rank: pivots.length } };
}
