import { Frac } from './fraction';
import type { FMatrix } from './matrix';
import { cols } from './matrix';
import { rref } from './rref';

export interface SolveResult {
  solvable: boolean; // b 是否 ∈ col(A)
  rankA: number;
  rankAug: number; // rank([A|b])，与 rankA 相等 ⇔ 有解
  unique: boolean; // 是否唯一解（有解且无自由变量）
  particular: Frac[] | null; // 一个特解（系数），自由变量取 0
  nullspace: Frac[][]; // 齐次解基础解系（每个自由变量一个向量）
  freeCols: number[]; // 自由变量列索引
  rrefAug: FMatrix; // 增广矩阵的 RREF（用于展示）
  pivots: number[];
}

/**
 * 求解 A x = b，即判断 b 能否由 A 的列（各特效药）线性组合得到，并给出系数。
 * - solvable=false ⇒ b 不在列空间内（无法配制）
 * - unique=false ⇒ 解不唯一，particular 仅为其中一组
 */
export function solve(A: FMatrix, b: Frac[]): SolveResult {
  const n = cols(A); // 未知数个数（列/药数）

  // 构造增广矩阵 [A | b]
  const aug: FMatrix = A.map((row, i) => [...row, b[i]]);
  const { R, pivots } = rref(aug);

  // 若最后一列（索引 n）是主元列 ⇒ 出现 [0…0 | 非0] ⇒ 不一致
  const solvable = !pivots.includes(n);
  const varPivots = pivots.filter((p) => p < n);
  const rankA = varPivots.length;
  const rankAug = pivots.length;

  const pivotSet = new Set(varPivots);
  const freeCols: number[] = [];
  for (let c = 0; c < n; c++) if (!pivotSet.has(c)) freeCols.push(c);

  let particular: Frac[] | null = null;
  const nullspace: Frac[][] = [];

  if (solvable) {
    // 特解：自由变量取 0，主元变量取增广列对应值
    particular = new Array(n).fill(Frac.ZERO);
    varPivots.forEach((pc, idx) => {
      // 主元变量 pc 对应 R 的第 idx 行（pivots 升序、与行一一对应）
      particular![pc] = R[idx][n];
    });

    // 基础解系：每个自由变量 = 1，其余自由变量 = 0
    for (const free of freeCols) {
      const vec: Frac[] = new Array(n).fill(Frac.ZERO);
      vec[free] = Frac.ONE;
      varPivots.forEach((pc, idx) => {
        vec[pc] = R[idx][free].neg();
      });
      nullspace.push(vec);
    }
  }

  return {
    solvable,
    rankA,
    rankAug,
    unique: solvable && freeCols.length === 0,
    particular,
    nullspace,
    freeCols,
    rrefAug: R,
    pivots,
  };
}
