import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompareRadarChart } from '@/components/compare/CompareRadarChart';
import { FinancialTable } from '@/components/ui/FinancialTable';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { compareApi } from '@/api/client';
import { useCompareStore } from '@/store/useCompareStore';
import type { CompareResponse } from '@/types';

export function ComparePage() {
  const { items, remove, clear } = useCompareStore();
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [withNarrative, setWithNarrative] = useState(false);

  useEffect(() => {
    if (items.length < 2) {
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    compareApi
      .compare({ corpCodes: items.map((i) => i.corpCode), includeNarrative: withNarrative })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [items, withNarrative]);

  return (
    <AppLayout>
      <header className="border-b-2 border-charcoal pb-4">
        <h1 className="font-display text-3xl font-bold">기업 비교</h1>
        <p className="mt-2 font-sans text-sm text-charcoal-gray">
          2~4개 기업을 선택하여 재무·성장·수익성을 비교합니다.
        </p>
      </header>

      <section className="mt-6">
        {items.length === 0 ? (
          <p className="font-sans text-charcoal-gray">
            비교할 기업이 없습니다.{' '}
            <Link to="/" className="text-accent-green underline">기업 검색</Link>
            에서 &quot;비교 추가&quot;를 눌러주세요.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {items.map((item) => (
                <span
                  key={item.corpCode}
                  className="flex items-center gap-2 border border-charcoal/20 px-3 py-1.5 font-sans text-sm"
                >
                  {item.corpName}
                  <button type="button" onClick={() => remove(item.corpCode)} className="text-charcoal-gray hover:text-accent-burgundy">×</button>
                </span>
              ))}
              <button type="button" onClick={clear} className="font-sans text-xs text-charcoal-gray underline">
                전체 삭제
              </button>
            </div>
            {items.length >= 2 && (
              <label className="mt-4 flex items-center gap-2 font-sans text-sm">
                <input
                  type="checkbox"
                  checked={withNarrative}
                  onChange={(e) => setWithNarrative(e.target.checked)}
                />
                AI 비교 해설 포함
              </label>
            )}
          </>
        )}
      </section>

      {loading && <div className="mt-8"><TableSkeleton /></div>}
      {error && <p className="mt-4 text-accent-burgundy">{error}</p>}

      {data && data.companies.length >= 2 && (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="mb-4 font-serif text-xl font-bold">수익성 비교</h2>
            <CompareRadarChart companies={data.companies} />
          </section>

          {data.companies.map((c) => (
            <section key={c.corpCode}>
              <h2 className="mb-4 font-serif text-xl font-bold">
                {c.corpName}{' '}
                <Link to={`/company/${c.corpCode}`} className="font-sans text-sm text-accent-green underline">
                  상세 →
                </Link>
              </h2>
              <FinancialTable statements={c.finance.statements} />
            </section>
          ))}

          {data.narrative && (
            <section className="border-t-2 border-charcoal pt-6">
              <h2 className="mb-4 font-serif text-xl font-bold">AI 비교 해설</h2>
              <p className="font-sans leading-relaxed text-charcoal-gray whitespace-pre-line">
                {data.narrative}
              </p>
              <div className="mt-4"><Disclaimer /></div>
            </section>
          )}
        </div>
      )}
    </AppLayout>
  );
}
