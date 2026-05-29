import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer,
} from 'recharts';
import type { CompareCompanyData } from '@/types';

interface Props {
  companies: CompareCompanyData[];
}

export function CompareRadarChart({ companies }: Props) {
  const axes = ['ROE', 'ROA', '영업이익률', '매출성장', '부채비율(역)'];

  const data = axes.map((axis) => {
    const row: Record<string, string | number> = { metric: axis };
    for (const c of companies) {
      const m = c.finance.metrics[0];
      if (!m) continue;
      const values: Record<string, number | null> = {
        ROE: m.roe,
        ROA: m.roa,
        '영업이익률': m.operatingMargin,
        '매출성장': m.revenueGrowth,
        '부채비율(역)': m.debtRatio !== null ? Math.max(0, 100 - m.debtRatio) : null,
      };
      row[c.corpName] = values[axis] ?? 0;
    }
    return row;
  });

  const colors = ['#1B4332', '#722F37', '#4A4A4A', '#8B7355'];

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data}>
        <PolarGrid stroke="#EDE8E0" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Legend />
        {companies.map((c, i) => (
          <Radar
            key={c.corpCode}
            name={c.corpName}
            dataKey={c.corpName}
            stroke={colors[i]}
            fill={colors[i]}
            fillOpacity={0.15}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
