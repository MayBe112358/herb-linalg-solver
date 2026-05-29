import type { HerbMatrix, TargetVector } from '@/types';

export const HERB_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
export const DRUG_LABELS = ['1号', '2号', '3号', '4号', '5号', '6号', '7号'];

/** 表1：七种药配料表（9 草药 × 7 药）。 */
export const TABLE1_DATA: number[][] = [
  [10, 2, 14, 13, 21, 39, 102],
  [12, 1, 14, 26, 36, 61, 57],
  [5, 4, 13, 1, 6, 15, 2],
  [7, 10, 27, 6, 16, 48, 37],
  [1, 2, 5, 26, 6, 34, 8],
  [25, 6, 37, 6, 36, 56, 52],
  [9, 5, 19, 26, 3, 40, 27],
  [6, 6, 18, 11, 11, 36, 12],
  [8, 3, 14, 1, 3, 7, 22],
];

/** 表2：三种新药配料表（列向量）。 */
export const TABLE2_DATA: Record<string, number[]> = {
  新1号: [72, 111, 26, 68, 62, 112, 84, 59, 24],
  新2号: [186, 182, 44, 163, 82, 182, 122, 102, 45],
  新3号: [44, 166, 65, 163, 108, 176, 116, 131, 14],
};

export function sampleMatrix(): HerbMatrix {
  return {
    id: 'sample-table1',
    name: '表1 · 七种药配料表',
    rowLabels: [...HERB_LABELS],
    colLabels: [...DRUG_LABELS],
    data: TABLE1_DATA.map((row) => row.map(String)),
    createdAt: Date.now(),
  };
}

export function sampleTargets(): TargetVector[] {
  return Object.entries(TABLE2_DATA).map(([label, values]) => ({
    label,
    values: values.map(String),
  }));
}

/** 生成空矩阵。 */
export function emptyMatrix(nRows: number, nCols: number): HerbMatrix {
  const rowLabels = Array.from({ length: nRows }, (_, i) =>
    i < 26 ? String.fromCharCode(65 + i) : `R${i + 1}`,
  );
  const colLabels = Array.from({ length: nCols }, (_, i) => `${i + 1}号`);
  return {
    id: crypto.randomUUID(),
    name: '未命名矩阵',
    rowLabels,
    colLabels,
    data: Array.from({ length: nRows }, () => Array.from({ length: nCols }, () => '0')),
    createdAt: Date.now(),
  };
}
