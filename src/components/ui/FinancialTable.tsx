import type { FinancialStatement } from '@/types';
import { formatNumber } from '@/utils/format';

interface Props {
  statements: FinancialStatement[];
}

const ROWS: { key: keyof Omit<FinancialStatement, 'year'>; label: string }[] = [
  { key: 'revenue', label: '매출액' },
  { key: 'operatingIncome', label: '영업이익' },
  { key: 'netIncome', label: '당기순이익' },
  { key: 'totalAssets', label: '자산총계' },
  { key: 'totalLiabilities', label: '부채총계' },
  { key: 'operatingCashFlow', label: '영업현금흐름' },
];

export function FinancialTable({ statements }: Props) {
  const years = statements.map((s) => s.year);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="border-b-2 border-charcoal">
            <th className="py-2 pr-4 text-left font-medium text-charcoal-gray">항목</th>
            {years.map((y) => (
              <th key={y} className="px-3 py-2 text-right font-medium">{y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ key, label }) => (
            <tr key={key} className="border-b border-charcoal/10">
              <td className="py-2.5 pr-4 text-charcoal-gray">{label}</td>
              {statements.map((s) => (
                <td key={s.year} className="px-3 py-2.5 text-right tabular-nums">
                  {formatNumber(s[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
