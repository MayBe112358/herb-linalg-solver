import { Matrix, SingularValueDecomposition } from 'ml-matrix';

export interface LeastSquaresResult {
  x: number[]; // 最小二乘系数
  residual: number[]; // A x - b
  residualNorm: number; // ‖A x - b‖₂（绝对误差）
  relativeError: number; // ‖A x - b‖ / ‖b‖
}

/**
 * 当 A x = b 无精确解时，求 minₓ‖A x − b‖₂ 的最小二乘解（浮点）。
 * 用伪逆（基于 SVD），对秩亏矩阵也稳定，给出最小范数解。
 */
export function leastSquares(A: number[][], b: number[]): LeastSquaresResult {
  const Amat = new Matrix(A);
  const bvec = Matrix.columnVector(b);
  // autoTranspose 处理行数>列数的超定情形；solve 对秩亏矩阵给出最小范数最小二乘解。
  const svd = new SingularValueDecomposition(Amat, { autoTranspose: true });
  const xvec = svd.solve(bvec);
  const x = xvec.to1DArray();

  const pred = Amat.mmul(xvec);
  const residual: number[] = [];
  let sumSq = 0;
  for (let i = 0; i < b.length; i++) {
    const d = pred.get(i, 0) - b[i];
    residual.push(d);
    sumSq += d * d;
  }
  const residualNorm = Math.sqrt(sumSq);
  const bNorm = Math.sqrt(b.reduce((s, v) => s + v * v, 0)) || 1;

  return { x, residual, residualNorm, relativeError: residualNorm / bNorm };
}
