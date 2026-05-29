import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { FinancialStatement } from '@/types';

interface Props {
  statements: FinancialStatement[];
}

export function BalanceSheetChart({ statements }: Props) {
  const data = [...statements].reverse().map((s) => ({
    year: s.year,
    자산: s.totalAssets ? s.totalAssets / 1e8 : 0,
    부채: s.totalLiabilities ? s.totalLiabilities / 1e8 : 0,
    자본: s.totalEquity
      ? s.totalEquity / 1e8
      : s.totalAssets && s.totalLiabilities
        ? (s.totalAssets - s.totalLiabilities) / 1e8
        : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="억" />
        <Tooltip formatter={(v: number) => `${v?.toFixed(0)}억`} />
        <Legend />
        <Bar dataKey="자산" stackId="a" fill="#1B4332" />
        <Bar dataKey="부채" stackId="b" fill="#722F37" />
        <Bar dataKey="자본" stackId="c" fill="#4A4A4A" />
      </BarChart>
    </ResponsiveContainer>
  );
}
