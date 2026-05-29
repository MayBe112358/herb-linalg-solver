import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { Frac } from '@/algorithms';

interface Props {
  coef: Frac[];
  colLabels: string[];
}

/** 展示各药在配方中的系数（带符号）。负系数标红，提示物理不可实现。 */
export function ContributionChart({ coef, colLabels }: Props) {
  const data = coef
    .map((c, j) => ({ name: colLabels[j], value: c.toNumber(), label: c.toString() }))
    .filter((d) => d.value !== 0);

  if (data.length === 0) return <p className="text-sm text-slate-400">无非零系数</p>;

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(_v, _n, p) => [`系数 ${p.payload.label}`, p.payload.name]} />
        <ReferenceLine x={0} stroke="#94a3b8" />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false} label={{ position: 'right', fontSize: 11 }}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.value < 0 ? '#f43f5e' : '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
