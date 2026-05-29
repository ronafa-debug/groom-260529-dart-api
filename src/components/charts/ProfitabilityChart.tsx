import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ValueMetrics } from '@/types';

interface Props {
  metrics: ValueMetrics[];
}

export function ProfitabilityChart({ metrics }: Props) {
  const data = [...metrics].reverse().map((m) => ({
    year: m.year,
    ROE: m.roe,
    ROA: m.roa,
    영업이익률: m.operatingMargin,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="%" />
        <Tooltip formatter={(v: number) => `${v?.toFixed(1)}%`} />
        <Legend />
        <Line type="monotone" dataKey="ROE" stroke="#1B4332" strokeWidth={2} />
        <Line type="monotone" dataKey="ROA" stroke="#722F37" strokeWidth={2} />
        <Line type="monotone" dataKey="영업이익률" stroke="#4A4A4A" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
