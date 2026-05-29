import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/primitives';
import { isValidCell } from '@/lib/parse';

/** 编辑待配制的目标向量（新药），按草药行对齐。 */
export function TargetInput() {
  const { current, targets, updateTargetCell, addTarget, removeTarget, setTargets } = useAppStore();
  const rowLabels = current.rowLabels;

  // 同步目标向量长度与草药行数
  const normalized = targets.map((t) => ({
    ...t,
    values: rowLabels.map((_, i) => t.values[i] ?? '0'),
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={addTarget}>+ 新目标药</Button>
        {targets.length > 0 && (
          <Button variant="ghost" onClick={() => setTargets([])}>清空</Button>
        )}
      </div>

      {normalized.length === 0 ? (
        <p className="text-sm text-slate-400">尚无目标药。点击"加载本题"会自动带入表2的三种新药。</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-slate-100 dark:bg-slate-800 px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">草药</th>
                {normalized.map((t, ti) => (
                  <th key={ti} className="bg-slate-50 px-1 py-1 dark:bg-slate-800">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        className="w-20 rounded bg-transparent text-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white focus:bg-white"
                        value={t.label}
                        onChange={(e) => {
                          const next = targets.map((x, i) => (i === ti ? { ...x, label: e.target.value } : x));
                          setTargets(next);
                        }}
                      />
                      <button
                        onClick={() => removeTarget(ti)}
                        className="rounded px-1 text-[10px] text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                      >
                        ✕ 删除
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowLabels.map((rl, r) => (
                <tr key={r} className="even:bg-slate-50/50 dark:even:bg-slate-800/40">
                  <th className="bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{rl}</th>
                  {normalized.map((t, ti) => {
                    const invalid = !isValidCell(t.values[r]);
                    return (
                      <td key={ti}>
                        <input
                          className={`cell-input w-20 px-2 py-1.5 text-center font-mono text-sm ${
                            invalid ? 'bg-rose-100 text-rose-700' : 'bg-transparent'
                          }`}
                          value={t.values[r]}
                          inputMode="decimal"
                          onChange={(e) => updateTargetCell(ti, r, e.target.value)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
