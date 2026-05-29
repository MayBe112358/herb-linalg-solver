/** 持久化用：单元格存字符串（分数原文），避免 BigInt 无法 JSON 序列化。 */
export interface HerbMatrix {
  id: string;
  name: string;
  rowLabels: string[]; // 草药名，如 ["A","B",...,"I"]
  colLabels: string[]; // 药名，如 ["1号","2号",...]
  data: string[][]; // [行][列]
  createdAt: number;
}

/** 一个目标向量（待配制的药）。 */
export interface TargetVector {
  label: string;
  values: string[]; // 长度 = 草药数（行数）
}

export type SolveMode = 'shortage' | 'newDrug';
