import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { MatrixGrid } from '@/components/MatrixGrid';
import { TargetInput } from '@/components/TargetInput';
import { ResultPanel } from '@/components/ResultPanel';
import { Card, Button, Badge, ProblemBanner } from '@/components/ui/primitives';
import { DependencyPanel } from '@/components/DependencyPanel';
import { allValid, toFMatrix, invalidCells } from '@/lib/compute';
import { rank, F, selectColumns, getColumn } from '@/algorithms';
import { printPage, exportElementToImage } from '@/lib/export';
import { buildShareUrl, decodeShare } from '@/lib/share';

export function SolverPage() {
  const { current, targets, disabledCols, toggleCol, saveCurrent, setCurrent, setTargets } = useAppStore();
  const [params, setParams] = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);

  // URL 分享：打开带 ?share= 的链接时还原矩阵与目标
  useEffect(() => {
    const code = params.get('share');
    if (!code) return;
    const payload = decodeShare(code);
    if (payload) {
      setCurrent(payload.m);
      setTargets(payload.t);
    }
    params.delete('share');
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyShareLink() {
    const url = buildShareUrl(current, targets);
    try {
      await navigator.clipboard.writeText(url);
      alert('分享链接已复制到剪贴板');
    } catch {
      prompt('复制下面的分享链接：', url);
    }
  }

  const valid = allValid(current.data);
  const A = useMemo(() => (valid ? toFMatrix(current.data) : null), [current.data, valid]);

  const nCols = current.colLabels.length;
  const rFull = useMemo(() => (A ? rank(A) : 0), [A]);

  // 复现缺货药时，源 = 其余所有未缺货的药
  const availCols = current.colLabels.map((_, i) => i).filter((i) => !disabledCols.includes(i));
  const availLabels = availCols.map((i) => current.colLabels[i]);
  const Aavail = useMemo(() => (A ? selectColumns(A, availCols) : null), [A, disabledCols]);

  const normalizedTargets = targets.map((t) => ({
    ...t,
    values: current.rowLabels.map((_, i) => t.values[i] ?? '0'),
  }));

  const shortageTargets = disabledCols.slice().sort((a, b) => a - b);
  const nothingToSolve = shortageTargets.length === 0 && normalizedTargets.length === 0;

  return (
    <div className="space-y-6">
      <ProblemBanner tag="核心问题">
        给定现有特效药，能否用它们的<strong>线性组合</strong>配制出目标药？怎么配？——
        等价于判断目标向量是否属于现有药张成的<strong>列空间</strong>，并求出用量系数。原题两小问本质相同：
        <br />· 把某些药标为<strong>缺货</strong> → 问"能否用其余药配出脱销的它们"（原题的 3号、6号，用其余 5 种配）。
        <br />· 在下方输入<strong>新药配方</strong>（表2）→ 问"能否用现有 7 种药配出全新药"。
      </ProblemBanner>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* 左：输入 */}
        <div className="space-y-6">
          <Card
            title="① 现有特效药矩阵（表1）"
            subtitle="每列一种药；点列头「可用 / 缺货」可把药标为脱销，作为待复现目标"
            actions={
              <>
                <Button variant="ghost" onClick={copyShareLink}>复制分享链接</Button>
                <Button onClick={saveCurrent}>保存到案例库</Button>
              </>
            }
          >
            <MatrixGrid disabledCols={disabledCols} onToggleCol={toggleCol} />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Badge tone="blue">矩阵 {current.rowLabels.length}×{nCols}</Badge>
              {valid ? (
                <>
                  <Badge tone={rFull === nCols ? 'green' : 'amber'}>rank(A) = {rFull}</Badge>
                  {rFull < nCols ? (
                    <Badge tone="amber">列线性相关（{nCols - rFull} 个依赖关系）</Badge>
                  ) : (
                    <Badge tone="green">列线性无关</Badge>
                  )}
                  {shortageTargets.length > 0 && (
                    <Badge tone="rose">缺货 {shortageTargets.length} 种 → 用其余 {availCols.length} 种复现</Badge>
                  )}
                </>
              ) : (
                <Badge tone="rose">存在 {invalidCells(current.data).length} 个非法单元格</Badge>
              )}
            </div>
            {valid && A && <DependencyPanel A={A} colLabels={current.colLabels} />}
          </Card>

          <Card title="② 待配制的新药（表2）" subtitle="判断能否用现有 7 种药线性组合得到；缺货药会自动加入下方结果">
            <TargetInput />
          </Card>
        </div>

        {/* 右：结果 */}
        <div className="space-y-6">
          <Card
            title="③ 配制结果"
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() => resultRef.current && exportElementToImage(resultRef.current, '配制结果.png')}
                >
                  导出图片
                </Button>
                <Button variant="ghost" onClick={printPage}>打印 / 存 PDF</Button>
              </>
            }
          >
            {!valid ? (
              <p className="text-sm text-rose-600">请先修正红色非法单元格。</p>
            ) : nothingToSolve ? (
              <p className="text-sm text-slate-400">
                点「加载本题」带入表1/表2。把 3号、6号 标为缺货即对应原题问题1；下方新药即对应问题2。
              </p>
            ) : (
              <div className="space-y-8" ref={resultRef}>
                {shortageTargets.map((d) => (
                  <div key={`s${d}`} className="border-t border-slate-100 pt-6 dark:border-slate-800 first:border-0 first:pt-0">
                    <ResultPanel
                      A={Aavail!}
                      b={getColumn(A!, d)}
                      colLabels={availLabels}
                      rowLabels={current.rowLabels}
                      targetLabel={`${current.colLabels[d]}（缺货 · 用其余 ${availCols.length} 种药配制）`}
                    />
                  </div>
                ))}
                {normalizedTargets.map((t, ti) => (
                  <div
                    key={`t${ti}`}
                    className={shortageTargets.length > 0 || ti > 0 ? 'border-t border-slate-100 pt-6 dark:border-slate-800' : ''}
                  >
                    <ResultPanel
                      A={A!}
                      b={t.values.map(F)}
                      colLabels={current.colLabels}
                      rowLabels={current.rowLabels}
                      targetLabel={t.label}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
