import { Card } from '@/components/ui/primitives';
import { Katex } from '@/components/ui/Katex';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card title="数学原理">
        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <p>
            把每种特效药的草药用量看作一个向量。7 种药构成矩阵{' '}
            <Katex tex="A = [\,a_1\ a_2\ \cdots\ a_7\,]" />（每列一种药）。
            "能否用现有药配制目标药 <Katex tex="b" />"，等价于问：
          </p>
          <p className="rounded-lg bg-brand-50/60 p-3 dark:bg-brand-900/20">
            <Katex block tex="\exists\, x \in \mathbb{R}^7,\ \ Ax = b \;?\quad\Longleftrightarrow\quad b \in \mathrm{Col}(A)" />
          </p>
          <p>
            其中 <Katex tex="x" /> 的分量就是各药的用量系数。判定依据是<strong>有解定理</strong>：
          </p>
          <p className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <Katex block tex="Ax=b \text{ 有解} \iff \mathrm{rank}(A) = \mathrm{rank}([A\,|\,b])" />
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>两秩相等 ⇒ 可配制；通过对 <Katex tex="[A\,|\,b]" /> 做行最简形（RREF）读出系数。</li>
            <li>秩不等（出现 <Katex tex="[\,0\ \cdots\ 0\ |\ c\neq 0\,]" /> 行）⇒ 无法精确配制。</li>
            <li>
              当 <Katex tex="\mathrm{rank}(A) < 列数" /> 时存在自由变量，解不唯一，配方有多组。
            </li>
            <li>无解时退而求其次，解最小二乘 <Katex tex="\min_x \lVert Ax-b\rVert_2" /> 得到最接近的近似配方。</li>
          </ul>
          <p className="text-slate-500">
            本工具全程使用 <strong>精确有理数（BigInt 分数）</strong> 做高斯-约旦消元，
            因此秩与系数都是精确值，不受浮点误差影响。
          </p>
        </div>
      </Card>

      <Card title="关于本题的注意点">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
          <li>
            系数可能为<strong>负数</strong>。负系数的物理诠释<strong>取决于混合方式</strong>，原题未指定，是一个开放问题：
            <ul className="mt-1 list-[circle] space-y-0.5 pl-5 text-slate-600 dark:text-slate-400">
              <li>若允许从混合中<strong>扣减</strong>（如粉剂可分离），则负系数可实现；</li>
              <li>若是<strong>液体/煎剂</strong>等不可逆混合，则该解无法直接实现；</li>
              <li>也可换个视角：直接按线性组合给出的<strong>净草药用量</strong>从原料配制，绕过该药中介。</li>
            </ul>
          </li>
          <li>
            解不唯一时给出的只是<strong>其中一组</strong>；工具会顺带搜索<strong>全加性解</strong>（所有系数 ≥ 0），
            如果存在，那就是无需扣减、最稳妥的配方。
          </li>
        </ul>
      </Card>
    </div>
  );
}
