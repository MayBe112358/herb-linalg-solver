import { Frac } from './fraction';
import type { FMatrix } from './matrix';
import { cols } from './matrix';
import { rref } from './rref';

export interface ColumnDependency {
  dependent: number; // 被表示的列索引（自由列）
  coef: Frac[]; // col[dependent] = Σ coef[j]·col[j]（coef[dependent] = 0）
}

/**
 * 找出列之间的线性相关关系：把每个自由列表示成主元列的组合。
 * 例：3号 = 1×1号 + 2×2号 → { dependent:2, coef:[1,2,0,0,0,0,0] }
 */
export function columnDependencies(A: FMatrix): ColumnDependency[] {
  const { R, pivots } = rref(A);
  const n = cols(A);
  const pivotSet = new Set(pivots);
  const out: ColumnDependency[] = [];

  for (let f = 0; f < n; f++) {
    if (pivotSet.has(f)) continue; // 主元列不是"被表示"的对象
    const coef: Frac[] = new Array(n).fill(Frac.ZERO);
    // 自由列 f = Σ_rowIdx R[rowIdx][f]·col_{pivots[rowIdx]}
    pivots.forEach((pc, rowIdx) => {
      coef[pc] = R[rowIdx][f];
    });
    out.push({ dependent: f, coef });
  }
  return out;
}
