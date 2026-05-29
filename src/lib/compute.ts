import { parseMatrix, type FMatrix } from '@/algorithms';
import { isValidCell } from './parse';

/** 找出所有非法单元格坐标。 */
export function invalidCells(data: string[][]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  data.forEach((row, r) => row.forEach((cell, c) => !isValidCell(cell) && out.push([r, c])));
  return out;
}

export function allValid(data: string[][]): boolean {
  return data.every((row) => row.every(isValidCell));
}

/** 当前矩阵 → 精确有理数矩阵（调用前应确保 allValid）。 */
export function toFMatrix(data: string[][]): FMatrix {
  return parseMatrix(data);
}
