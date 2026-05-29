import { Frac } from './fraction';
import type { SolveResult } from './solve';

export interface NonNegResult {
  found: boolean;
  solution?: Frac[]; // 一组全非负系数（物理可实现的配方）
  reason?: string;
}

/**
 * 在解空间 particular + t·nullspace[0] 中寻找全非负解（物理意义：用量不能为负）。
 * 仅严格处理"恰好 1 个自由变量"的常见情形（本题如此）。
 */
export function findNonNegative(res: SolveResult): NonNegResult {
  if (!res.solvable || !res.particular) {
    return { found: false, reason: '原问题无解' };
  }
  if (res.nullspace.length === 0) {
    // 唯一解：直接看是否非负
    const ok = res.particular.every((c) => !c.isNeg());
    return ok
      ? { found: true, solution: res.particular }
      : { found: false, reason: '唯一解中含负系数，无法用非负用量配制' };
  }
  if (res.nullspace.length > 1) {
    return { found: false, reason: '存在多个自由变量，未自动搜索非负解' };
  }

  // 单自由变量：x_i(t) = p_i + t·v_i ≥ 0
  const p = res.particular;
  const v = res.nullspace[0];
  let lower: Frac | null = null; // t ≥ lower
  let upper: Frac | null = null; // t ≤ upper

  for (let i = 0; i < p.length; i++) {
    if (v[i].isZero()) {
      if (p[i].isNeg()) return { found: false, reason: '不存在非负解' };
      continue;
    }
    const bound = p[i].neg().div(v[i]); // 临界 t
    if (!v[i].isNeg()) {
      // v_i > 0 ⇒ t ≥ bound
      if (lower === null || bound.cmp(lower) > 0) lower = bound;
    } else {
      // v_i < 0 ⇒ t ≤ bound
      if (upper === null || bound.cmp(upper) < 0) upper = bound;
    }
  }

  if (lower !== null && upper !== null && lower.cmp(upper) > 0) {
    return { found: false, reason: '不存在非负解' };
  }

  // 在 [lower, upper] 内选一个 t：优先 0，否则取最近端点
  let t = Frac.ZERO;
  if (lower !== null && t.cmp(lower) < 0) t = lower;
  if (upper !== null && t.cmp(upper) > 0) t = upper;

  const solution = p.map((pi, i) => pi.add(t.mul(v[i])));
  return { found: true, solution };
}
