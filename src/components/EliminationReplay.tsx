import { useEffect, useMemo, useRef, useState } from 'react';
import { rrefSteps, type FMatrix } from '@/algorithms';
import { Button } from './ui/primitives';

interface Props {
  matrix: FMatrix;
  colLabels?: string[];
  /** 用竖线标出的增广列索引（如 [A|b] 的最后一列）。 */
  augCol?: number;
}

/** A-4：高斯-约旦消元逐步回放，可前进/后退/自动播放。 */
export function EliminationReplay({ matrix, colLabels, augCol = -1 }: Props) {
  const { steps } = useMemo(() => rrefSteps(matrix), [matrix]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  // 矩阵变化时重置
  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [matrix]);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setI((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, steps.length]);

  const step = steps[i];
  const ncols = step.matrix[0]?.length ?? 0;
  const typeColor: Record<string, string> = {
    init: 'bg-slate-100 text-slate-600',
    swap: 'bg-violet-100 text-violet-700',
    scale: 'bg-blue-100 text-blue-700',
    eliminate: 'bg-emerald-100 text-emerald-700',
    skip: 'bg-amber-100 text-amber-700',
    done: 'bg-emerald-600 text-white',
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setI(0)} disabled={i === 0}>⏮ 首</Button>
        <Button variant="secondary" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>◀ 上一步</Button>
        <Button variant="primary" onClick={() => setPlaying((p) => !p)}>
          {playing ? '⏸ 暂停' : '▶ 播放'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))}
          disabled={i === steps.length - 1}
        >
          下一步 ▶
        </Button>
        <Button variant="ghost" onClick={() => setI(steps.length - 1)} disabled={i === steps.length - 1}>末 ⏭</Button>
        <span className="ml-auto text-xs text-slate-500">
          第 {i + 1} / {steps.length} 步
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={steps.length - 1}
        value={i}
        onChange={(e) => {
          setPlaying(false);
          setI(Number(e.target.value));
        }}
        className="w-full accent-brand-600"
      />

      <div className="flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${typeColor[step.type]}`}>
          {step.type}
        </span>
        <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{step.desc}</span>
      </div>

      <div className="overflow-auto">
        <table className="border-collapse font-mono text-sm">
          {colLabels && (
            <thead>
              <tr>
                {Array.from({ length: ncols }).map((_, c) => (
                  <td key={c} className="px-3 py-1 text-center text-xs font-semibold text-slate-400">
                    {c === augCol ? 'b' : colLabels[c] ?? `c${c + 1}`}
                  </td>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {step.matrix.map((row, r) => {
              const active = step.activeRows.includes(r);
              return (
                <tr key={r} className={active ? 'bg-yellow-100/70' : ''}>
                  {row.map((x, c) => {
                    const isPivot = step.pivot && step.pivot[0] === r && step.pivot[1] === c;
                    return (
                      <td
                        key={c}
                        className={`border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-center ${
                          c === augCol ? 'border-l-2 border-l-brand-400 bg-brand-50/40' : ''
                        } ${isPivot ? 'ring-2 ring-inset ring-rose-400 font-bold' : ''} ${
                          x.isNeg() ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {x.toString()}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
