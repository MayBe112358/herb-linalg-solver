import { useState } from 'react';
import { Frac, F } from '@/algorithms';
import { fracDisplay } from '@/lib/format';
import { Badge, Button } from './ui/primitives';
import { ContributionChart } from './ContributionChart';

interface Props {
  particular: Frac[];
  nullspace: Frac[][]; // 每个自由变量一个基础解向量
  colLabels: string[];
}

/**
 * A-3：解不唯一时，拖动每个自由变量参数 t_i，实时查看通解
 *   x = 特解 + Σ tᵢ · 基础解系ᵢ
 * 系数为负时标红（物理不可实现）。
 */
export function GeneralSolutionExplorer({ particular, nullspace, colLabels }: Props) {
  const [ts, setTs] = useState<number[]>(() => nullspace.map(() => 0));

  const x = particular.map((p, j) => {
    let acc = p;
    nullspace.forEach((vec, k) => {
      acc = acc.add(F(ts[k]).mul(vec[j]));
    });
    return acc;
  });

  const allNonNeg = x.every((c) => !c.isNeg());

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">通解探索器</span>
        <Badge tone="amber">{nullspace.length} 个自由参数</Badge>
        {allNonNeg ? (
          <Badge tone="green">全加性配方 · 只需相加</Badge>
        ) : (
          <Badge tone="amber">含扣减项 · 需从混合中减去</Badge>
        )}
        <Button variant="ghost" className="ml-auto" onClick={() => setTs(nullspace.map(() => 0))}>
          重置为特解
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        x = 特解 {ts.map((_, k) => `+ t${k + 1}·基础解系${k + 1}`).join(' ')}
        ，拖动滑块改变 tᵢ 观察配方如何变化。
      </p>

      {nullspace.map((_, k) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-12 shrink-0 font-mono text-sm text-slate-600 dark:text-slate-300">t{k + 1} = {ts[k]}</span>
          <input
            type="range"
            min={-10}
            max={10}
            step={1}
            value={ts[k]}
            onChange={(e) => {
              const v = Number(e.target.value);
              setTs((prev) => prev.map((t, idx) => (idx === k ? v : t)));
            }}
            className="w-full accent-brand-600"
          />
        </div>
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">当前配方系数</h4>
          <div className="flex flex-wrap gap-2">
            {x.map((c, j) => (
              <span
                key={j}
                className={`rounded-lg px-2 py-1 text-sm font-mono ${
                  c.isZero()
                    ? 'bg-slate-100 text-slate-400'
                    : c.isNeg()
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {colLabels[j]}: {fracDisplay(c)}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">系数可视化</h4>
          <ContributionChart coef={x} colLabels={colLabels} />
        </div>
      </div>
    </div>
  );
}
