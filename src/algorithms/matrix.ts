import { Frac, F } from './fraction';

export type FMatrix = Frac[][]; // [行][列]

/** 由字符串矩阵解析为精确有理数矩阵。 */
export function parseMatrix(data: string[][]): FMatrix {
  return data.map((row) => row.map((cell) => F(cell)));
}

/** 由数字矩阵构造。 */
export function fromNumbers(data: number[][]): FMatrix {
  return data.map((row) => row.map((cell) => F(cell)));
}

export function rows(m: FMatrix): number {
  return m.length;
}
export function cols(m: FMatrix): number {
  return m.length === 0 ? 0 : m[0].length;
}

/** 取第 j 列为列向量。 */
export function getColumn(m: FMatrix, j: number): Frac[] {
  return m.map((row) => row[j]);
}

/** 仅取指定列，组成新矩阵。 */
export function selectColumns(m: FMatrix, colIndices: number[]): FMatrix {
  return m.map((row) => colIndices.map((j) => row[j]));
}

export function transpose(m: FMatrix): FMatrix {
  const r = rows(m);
  const c = cols(m);
  const out: FMatrix = [];
  for (let j = 0; j < c; j++) {
    out.push([]);
    for (let i = 0; i < r; i++) out[j].push(m[i][j]);
  }
  return out;
}

/** 列向量数组拼成矩阵：columns[j] 成为第 j 列。 */
export function fromColumns(columns: Frac[][]): FMatrix {
  const r = columns[0]?.length ?? 0;
  const out: FMatrix = [];
  for (let i = 0; i < r; i++) {
    out.push(columns.map((col) => col[i]));
  }
  return out;
}

/** 线性组合：sum_j coef[j] * column_j，返回结果向量。 */
export function linearCombination(m: FMatrix, coef: Frac[]): Frac[] {
  const r = rows(m);
  const out: Frac[] = [];
  for (let i = 0; i < r; i++) {
    let acc = Frac.ZERO;
    for (let j = 0; j < coef.length; j++) acc = acc.add(m[i][j].mul(coef[j]));
    out.push(acc);
  }
  return out;
}

export function vecToNumbers(v: Frac[]): number[] {
  return v.map((x) => x.toNumber());
}
export function matToNumbers(m: FMatrix): number[][] {
  return m.map((row) => row.map((x) => x.toNumber()));
}
