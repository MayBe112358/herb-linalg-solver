import type { FMatrix } from '@/algorithms';

interface Props {
  R: FMatrix;
  pivots: number[];
  /** 增广矩阵时，最后一列是 b（用竖线分隔显示）。 */
  augmented?: boolean;
  colLabels?: string[];
}

export function RrefViewer({ R, pivots, augmented, colLabels }: Props) {
  if (R.length === 0) return null;
  const ncols = R[0].length;
  const pivotSet = new Set(pivots);
  const bCol = augmented ? ncols - 1 : -1;

  return (
    <div className="overflow-auto">
      <table className="border-collapse font-mono text-sm">
        {colLabels && (
          <thead>
            <tr>
              {Array.from({ length: ncols }).map((_, c) => (
                <td
                  key={c}
                  className={`px-3 py-1 text-center text-xs font-semibold ${
                    c === bCol ? 'text-brand-600' : 'text-slate-400'
                  } ${pivotSet.has(c) ? 'text-brand-600' : ''}`}
                >
                  {c === bCol ? 'b' : (colLabels[c] ?? `c${c + 1}`)}
                </td>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {R.map((row, r) => (
            <tr key={r}>
              {row.map((x, c) => (
                <td
                  key={c}
                  className={`border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-center ${
                    c === bCol ? 'bg-brand-50/70 border-l-2 border-l-brand-400' : ''
                  } ${pivotSet.has(c) && !x.isZero() ? 'bg-amber-50 font-semibold text-amber-800' : ''} ${
                    x.isNeg() ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {x.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400">
        <span className="rounded bg-amber-50 px-1 text-amber-800">黄色</span> = 主元；
        {augmented && <> <span className="rounded bg-brand-50 px-1 text-brand-600">蓝色</span> = 增广列 b；</>}
        非主元列对应自由变量。
      </p>
    </div>
  );
}
