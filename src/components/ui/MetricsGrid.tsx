import type { ValueMetrics } from '@/types';
import { formatPercent, formatRatio } from '@/utils/format';

interface Props {
  metrics: ValueMetrics[];
}

const METRIC_ROWS: { key: keyof Omit<ValueMetrics, 'year'>; label: string; format: 'ratio' | 'percent' }[] = [
  { key: 'per', label: 'PER', format: 'ratio' },
  { key: 'pbr', label: 'PBR', format: 'ratio' },
  { key: 'roe', label: 'ROE', format: 'percent' },
  { key: 'roa', label: 'ROA', format: 'percent' },
  { key: 'debtRatio', label: '부채비율', format: 'percent' },
  { key: 'operatingMargin', label: '영업이익률', format: 'percent' },
  { key: 'revenueGrowth', label: '매출 성장률', format: 'percent' },
  { key: 'epsGrowth', label: 'EPS 성장률', format: 'percent' },
];

export function MetricsGrid({ metrics }: Props) {
  const latest = metrics[0];
  if (!latest) return null;

  return (
    <div className="grid grid-cols-2 gap-px border border-charcoal/10 bg-charcoal/10 md:grid-cols-4">
      {METRIC_ROWS.map(({ key, label, format }) => (
        <div key={key} className="bg-warm-white px-4 py-3">
          <p className="font-sans text-xs text-charcoal-gray">{label}</p>
          <p className="mt-1 font-serif text-lg font-bold tabular-nums">
            {format === 'percent' ? formatPercent(latest[key]) : formatRatio(latest[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
