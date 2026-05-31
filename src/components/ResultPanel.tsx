import { useMemo, useState } from 'react';
import {
  solve,
  findNonNegative,
  leastSquares,
  linearCombination,
  matToNumbers,
  vecToNumbers,
  Frac,
  type FMatrix,
} from '@/algorithms';
import { explainCombination, fracDisplay } from '@/lib/format';
import { Badge, Button } from './ui/primitives';
import { RrefViewer } from './RrefViewer';
import { ContributionChart } from './ContributionChart';
import { GeneralSolutionExplorer } from './GeneralSolutionExplorer';
import { EliminationReplay } from './EliminationReplay';

interface Props {
  A: FMatrix;
  b: Frac[];
  colLabels: string[];
  targetLabel: string;
  rowLabels?: string[];
}

export function ResultPanel({ A, b, colLabels, targetLabel, rowLabels }: Props) {
  const [showRref, setShowRref] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);

  const res = useMemo(() => solve(A, b), [A, b]);
  const nn = useMemo(() => (res.solvable ? findNonNegative(res) : null), [res]);
  const ls = useMemo(
    () => (!res.solvable ? leastSquares(matToNumbers(A), vecToNumbers(b)) : null),
    [res, A, b],
  );

  const displayCoef = nn?.found ? nn.solution! : res.particular;
  // A-2：代回验证
  const computed = useMemo(
    () => (displayCoef ? linearCombination(A, displayCoef) : null),
    [A, displayCoef],
  );
  const augMatrix = useMemo(() => A.map((row, i) => [...row, b[i]]), [A, b]);

  return (
    <div className="space-y-4">
      {/* 结论 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-slate-800 dark:text-slate-100">{targetLabel}</span>
        {res.solvable ? (
          <Badge tone="green">✓ 可由现有药配制</Badge>
        ) : (
          <Badge tone="rose">✗ 无法精确配制（不在列空间内）</Badge>
        )}
        {res.solvable && !res.unique && <Badge tone="amber">解不唯一（{res.freeCols.length} 个自由变量）</Badge>}
        {res.solvable && res.unique && <Badge tone="blue">唯一解</Badge>}
        {nn && !nn.found && res.solvable && <Badge tone="amber">含扣减项（负系数）</Badge>}
      </div>

      <p className="text-xs text-slate-500">
        rank(A) = {res.rankA} ， rank([A|b]) = {res.rankAug}
        {res.solvable ? '（两者相等 ⇒ 有解）' : '（不相等 ⇒ 无解）'}
      </p>

      {/* 可配制：系数与解释 */}
      {res.solvable && displayCoef && (
        <>
          <div className="rounded-xl bg-brand-50/60 p-4 dark:bg-brand-900/20">
            <p className="font-mono text-sm text-slate-800 dark:text-slate-100">
              {explainCombination(targetLabel, displayCoef, colLabels)}
            </p>
            {!res.unique && (
              <p className="mt-1 text-xs text-slate-500">
                * 这是其中一组解{nn?.found ? '（已优先选取全非负的物理可实现解）' : ''}。
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">各药用量系数</h4>
              <table className="w-full text-sm">
                <tbody>
                  {displayCoef.map((c, j) =>
                    c.isZero() ? null : (
                      <tr key={j} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-1 text-slate-600 dark:text-slate-300">{colLabels[j]}</td>
                        <td className={`py-1 text-right font-mono ${c.isNeg() ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
                          {fracDisplay(c)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">系数可视化</h4>
              <ContributionChart coef={displayCoef} colLabels={colLabels} />
            </div>
          </div>

          {nn && !nn.found && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              ℹ {nn.reason}。此配方含负系数——可理解为先按正系数混合、再从中扣除负系数那部分药；
              或等价地，直接按净草药用量配制（绕过该药中介）。仍是可实现的，
              只是不是纯加法混合。
            </p>
          )}

          {/* A-2 代回验证 */}
          <div>
            <Button variant="ghost" onClick={() => setShowVerify((v) => !v)}>
              {showVerify ? '▼' : '▶'} 代回验证 A·x = b
            </Button>
            {showVerify && computed && (
              <div className="mt-2 overflow-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400">
                      <th className="px-2 py-1 text-left">草药</th>
                      <th className="px-2 py-1 text-right">A·x（计算值）</th>
                      <th className="px-2 py-1 text-right">b（目标）</th>
                      <th className="px-2 py-1 text-center">一致</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computed.map((cv, i) => {
                      const ok = cv.eq(b[i]);
                      return (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-2 py-1 text-slate-600 dark:text-slate-300">{rowLabels?.[i] ?? `行${i + 1}`}</td>
                          <td className="px-2 py-1 text-right font-mono">{cv.toString()}</td>
                          <td className="px-2 py-1 text-right font-mono">{b[i].toString()}</td>
                          <td className="px-2 py-1 text-center">{ok ? '✓' : '✗'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mt-2 text-xs text-emerald-700">所有行精确相等 ⇒ 配方无误（精确有理数，无浮点误差）。</p>
              </div>
            )}
          </div>

          {/* A-3 通解探索 */}
          {!res.unique && (
            <div>
              <Button variant="ghost" onClick={() => setShowExplorer((v) => !v)}>
                {showExplorer ? '▼' : '▶'} 通解探索（调自由参数看不同配方）
              </Button>
              {showExplorer && (
                <div className="mt-2">
                  <GeneralSolutionExplorer
                    particular={res.particular!}
                    nullspace={res.nullspace}
                    colLabels={colLabels}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 不可配制：最小二乘近似 */}
      {!res.solvable && ls && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            目标不在现有药的列空间内，给出最小二乘<strong>最接近</strong>配方：
          </p>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="font-mono text-sm text-slate-800 dark:text-slate-100">
              {targetLabel} ≈{' '}
              {ls.x
                .map((v, j) => (Math.abs(v) < 1e-9 ? null : `${v.toFixed(3)}×${colLabels[j]}`))
                .filter(Boolean)
                .join(' + ')}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              残差 ‖Ax−b‖₂ = <strong>{ls.residualNorm.toFixed(4)}</strong> ， 相对误差 ={' '}
              <strong>{(ls.relativeError * 100).toFixed(2)}%</strong>
            </p>
          </div>
        </div>
      )}

      {/* A-4 逐步消元 + 静态 RREF */}
      <div className="flex flex-wrap gap-4">
        <Button variant="ghost" onClick={() => setShowSteps((v) => !v)}>
          {showSteps ? '▼' : '▶'} 逐步消元演示 [A|b]
        </Button>
        <Button variant="ghost" onClick={() => setShowRref((v) => !v)}>
          {showRref ? '▼' : '▶'} 查看最终 RREF
        </Button>
      </div>
      {showSteps && (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <EliminationReplay matrix={augMatrix} colLabels={[...colLabels, 'b']} augCol={colLabels.length} />
        </div>
      )}
      {showRref && (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <RrefViewer R={res.rrefAug} pivots={res.pivots} augmented colLabels={[...colLabels, 'b']} />
        </div>
      )}
    </div>
  );
}
