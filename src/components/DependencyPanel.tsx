import { useMemo } from 'react';
import { columnDependencies, type FMatrix } from '@/algorithms';
import { explainCombination } from '@/lib/format';

interface Props {
  A: FMatrix;
  colLabels: string[];
}

/** A-1：自动展示列之间的线性相关关系（哪种药是其他药的组合）。 */
export function DependencyPanel({ A, colLabels }: Props) {
  const deps = useMemo(() => columnDependencies(A), [A]);
  if (deps.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <p className="mb-1 text-sm font-semibold text-amber-800">
        🔎 系统自动发现 {deps.length} 个线性相关关系
      </p>
      <ul className="space-y-1">
        {deps.map((d) => (
          <li key={d.dependent} className="font-mono text-sm text-slate-800 dark:text-amber-100">
            {explainCombination(colLabels[d.dependent], d.coef, colLabels)}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-amber-700/80">
        这正是 rank 小于列数的原因——有药能被其他药配出，因此缺货时可被替代。
      </p>
    </div>
  );
}
