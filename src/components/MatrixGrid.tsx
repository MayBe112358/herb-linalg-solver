import { useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/primitives';
import { parsePastedText, parseCsv, parseExcel, inferTable, isValidCell } from '@/lib/parse';
import { exportMatrixToExcel } from '@/lib/export';
import type { HerbMatrix } from '@/types';

interface Props {
  /** 可选：将某些列标记为禁用（缺货模拟用），点击列头切换。 */
  disabledCols?: number[];
  onToggleCol?: (c: number) => void;
}

export function MatrixGrid({ disabledCols = [], onToggleCol }: Props) {
  const { current, updateCell, setRowLabel, setColLabel, addRow, addCol, removeRow, removeCol, setCurrent, loadSample } =
    useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  function applyParsed(raw: string[][]) {
    const { rowLabels, colLabels, data } = inferTable(raw);
    if (data.length === 0) {
      alert('未能解析出数据');
      return;
    }
    const m: HerbMatrix = {
      id: crypto.randomUUID(),
      name: '导入的矩阵',
      rowLabels,
      colLabels,
      data,
      createdAt: Date.now(),
    };
    setCurrent(m);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.csv')) {
      applyParsed(parseCsv(await file.text()));
    } else {
      applyParsed(await parseExcel(await file.arrayBuffer()));
    }
    e.target.value = '';
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={loadSample}>加载本题（表1+表2）</Button>
        <Button onClick={() => setPasteOpen((v) => !v)}>粘贴表格</Button>
        <Button onClick={() => fileRef.current?.click()}>上传 CSV/Excel</Button>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFile} />
        <Button onClick={() => exportMatrixToExcel(current, '配料表.xlsx')}>导出 Excel</Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={addRow}>+ 草药行</Button>
          <Button variant="ghost" onClick={addCol}>+ 药列</Button>
        </div>
      </div>

      {pasteOpen && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 p-3 dark:bg-slate-800/50">
          <textarea
            className="h-28 w-full rounded-md border border-slate-300 p-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-900"
            placeholder="从 Excel 复制后粘贴到这里（支持 Tab / 逗号 / 空格分隔，可含表头）"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                applyParsed(parsePastedText(pasteText));
                setPasteOpen(false);
                setPasteText('');
              }}
            >
              解析并应用
            </Button>
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>取消</Button>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                草药 \ 药
              </th>
              {current.colLabels.map((label, c) => {
                const disabled = disabledCols.includes(c);
                return (
                  <th key={c} className="bg-slate-50 px-1 py-1 dark:bg-slate-800">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        className="w-16 rounded bg-transparent text-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white focus:bg-white"
                        value={label}
                        onChange={(e) => setColLabel(c, e.target.value)}
                      />
                      <div className="flex items-center gap-1">
                        {onToggleCol && (
                          <button
                            title={disabled ? '点击恢复' : '点击标记为缺货/禁用'}
                            onClick={() => onToggleCol(c)}
                            className={`rounded px-1 text-[10px] ${
                              disabled ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            {disabled ? '缺货' : '可用'}
                          </button>
                        )}
                        <button
                          title="删除该列"
                          onClick={() => removeCol(c)}
                          className="rounded px-1 text-[10px] text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {current.data.map((row, r) => (
              <tr key={r} className="even:bg-slate-50/50 dark:even:bg-slate-800/40">
                <th className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 px-1 py-1">
                  <div className="flex items-center gap-1">
                    <input
                      className="w-10 rounded bg-transparent text-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white focus:bg-white"
                      value={current.rowLabels[r]}
                      onChange={(e) => setRowLabel(r, e.target.value)}
                    />
                    <button
                      title="删除该行"
                      onClick={() => removeRow(r)}
                      className="rounded px-1 text-[10px] text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                </th>
                {row.map((cell, c) => {
                  const invalid = !isValidCell(cell);
                  const disabled = disabledCols.includes(c);
                  return (
                    <td key={c} className={disabled ? 'bg-rose-50/60 dark:bg-rose-900/30' : ''}>
                      <input
                        className={`cell-input w-16 px-2 py-1.5 text-center font-mono text-sm ${
                          invalid ? 'bg-rose-100 text-rose-700' : 'bg-transparent'
                        }`}
                        value={cell}
                        inputMode="decimal"
                        onChange={(e) => updateCell(r, c, e.target.value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        单元格支持整数、小数与分数（如 <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">3/7</code>）。非法输入会高亮为红色。
      </p>
    </div>
  );
}
