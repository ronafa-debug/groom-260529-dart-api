import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { FinancialStatement } from '@/types';

interface Props {
  statements: FinancialStatement[];
}

export function RevenueChart({ statements }: Props) {
  const data = [...statements].reverse().map((s) => ({
    year: s.year,
    매출액: s.revenue ? s.revenue / 1e8 : null,
    영업이익: s.operatingIncome ? s.operatingIncome / 1e8 : null,
    순이익: s.netIncome ? s.netIncome / 1e8 : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="억" />
        <Tooltip formatter={(v: number) => `${v?.toFixed(0)}억`} />
        <Legend />
        <Bar dataKey="매출액" fill="#1B4332" opacity={0.7} />
        <Line type="monotone" dataKey="영업이익" stroke="#722F37" strokeWidth={2} dot />
        <Line type="monotone" dataKey="순이익" stroke="#4A4A4A" strokeWidth={2} dot />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
