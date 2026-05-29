import { Frac } from './fraction';
import type { FMatrix } from './matrix';

export interface RrefResult {
  R: FMatrix; // 行最简形（行简化阶梯形）
  pivots: number[]; // 各主元所在的列索引（升序）
  rank: number;
}

/** 高斯-约旦消元 → RREF。精确有理数，无需阈值判断。不修改输入。 */
export function rref(matrix: FMatrix): RrefResult {
  const M: FMatrix = matrix.map((row) => row.slice());
  const nrows = M.length;
  const ncols = nrows === 0 ? 0 : M[0].length;
  const pivots: number[] = [];
  let r = 0;

  for (let c = 0; c < ncols && r < nrows; c++) {
    // 找当前列从 r 行起第一个非零元作为主元
    let pivotRow = -1;
    for (let i = r; i < nrows; i++) {
      if (!M[i][c].isZero()) {
        pivotRow = i;
        break;
      }
    }
    if (pivotRow === -1) continue; // 该列无主元，跳过（自由列）

    // 交换到 r 行
    [M[r], M[pivotRow]] = [M[pivotRow], M[r]];

    // 主元归一
    const pivotVal = M[r][c];
    M[r] = M[r].map((x) => x.div(pivotVal));

    // 消去其余行该列
    for (let i = 0; i < nrows; i++) {
      if (i !== r && !M[i][c].isZero()) {
        const factor = M[i][c];
        M[i] = M[i].map((x, k) => x.sub(factor.mul(M[r][k])));
      }
    }

    pivots.push(c);
    r++;
  }

  return { R: M, pivots, rank: pivots.length };
}

/** 矩阵的秩。 */
export function rank(matrix: FMatrix): number {
  return rref(matrix).rank;
}

/** 判断一组列向量是否线性无关。 */
export function isIndependent(matrix: FMatrix): boolean {
  return rank(matrix) === (matrix[0]?.length ?? 0);
}

/** 找出列之间的线性相关关系（零空间基），用于"哪些药是其他药的组合"。 */
export function nullSpaceBasis(matrix: FMatrix): Frac[][] {
  const { R, pivots } = rref(matrix);
  const ncols = matrix[0]?.length ?? 0;
  const pivotSet = new Set(pivots);
  const freeCols = [];
  for (let c = 0; c < ncols; c++) if (!pivotSet.has(c)) freeCols.push(c);

  const basis: Frac[][] = [];
  for (const free of freeCols) {
    const vec: Frac[] = new Array(ncols).fill(Frac.ZERO);
    vec[free] = Frac.ONE;
    pivots.forEach((pc, rowIdx) => {
      vec[pc] = R[rowIdx][free].neg();
    });
    basis.push(vec);
  }
  return basis;
}
