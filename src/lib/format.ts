import { Frac } from '@/algorithms';
import type { FMatrix } from '@/algorithms';

/** 把系数向量转成自然语言配方，如 "新1号 = 2×1号 + 1×4号 + 1×6号"。跳过 0 系数。 */
export function explainCombination(
  targetLabel: string,
  coef: Frac[],
  colLabels: string[],
): string {
  const terms: string[] = [];
  coef.forEach((c, j) => {
    if (c.isZero()) return;
    const abs = c.abs();
    const coefStr = abs.eq(Frac.ONE) ? '' : `${abs.toString()}×`;
    const sign = c.isNeg() ? '−' : terms.length === 0 ? '' : '+';
    const piece = `${coefStr}${colLabels[j]}`;
    terms.push(sign ? `${sign} ${piece}` : piece);
  });
  if (terms.length === 0) return `${targetLabel} = 0（零向量）`;
  return `${targetLabel} = ${terms.join(' ')}`;
}

/** Frac 矩阵 → LaTeX bmatrix。 */
export function matrixToLatex(m: FMatrix): string {
  const body = m
    .map((row) => row.map((x) => x.toLatex()).join(' & '))
    .join(' \\\\ ');
  return `\\begin{bmatrix} ${body} \\end{bmatrix}`;
}

/** Frac 向量 → 列向量 LaTeX。 */
export function vectorToLatex(v: Frac[]): string {
  return `\\begin{bmatrix} ${v.map((x) => x.toLatex()).join(' \\\\ ')} \\end{bmatrix}`;
}

/** 同时显示分数与小数近似，如 "3/7 ≈ 0.4286"。整数只显示本身。 */
export function fracDisplay(x: Frac): string {
  if (x.isInt()) return x.toString();
  return `${x.toString()} ≈ ${x.toNumber().toFixed(4)}`;
}
