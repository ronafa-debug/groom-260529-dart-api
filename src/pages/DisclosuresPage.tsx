import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { disclosuresApi } from '@/api/client';
import { formatDate } from '@/utils/format';
import type { Disclosure } from '@/types';

const POLL_INTERVAL = 5 * 60 * 1000;

export function DisclosuresPage() {
  const [searchParams] = useSearchParams();
  const corpCode = searchParams.get('corpCode') ?? undefined;
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);

  const fetchDisclosures = useCallback(() => {
    setLoading(true);
    disclosuresApi
      .list(corpCode)
      .then(setDisclosures)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [corpCode]);

  useEffect(() => {
    fetchDisclosures();
    const timer = setInterval(fetchDisclosures, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchDisclosures]);

  async function handleSummarize(d: Disclosure) {
    if (summaries[d.rceptNo]) return;
    setLoadingSummary(d.rceptNo);
    try {
      const result = await disclosuresApi.summarize({
        rceptNo: d.rceptNo,
        corpName: d.corpName,
        reportNm: d.reportNm,
      });
      setSummaries((prev) => ({ ...prev, [d.rceptNo]: result.summary }));
    } catch {
      setSummaries((prev) => ({ ...prev, [d.rceptNo]: '요약을 생성할 수 없습니다.' }));
    } finally {
      setLoadingSummary(null);
    }
  }

  const important = disclosures.filter((d) => d.isImportant);

  return (
    <AppLayout>
      <header className="border-b-2 border-charcoal pb-4">
        <h1 className="font-display text-3xl font-bold">공시 모니터링</h1>
        <p className="mt-2 font-sans text-sm text-charcoal-gray">
          {corpCode ? '선택 기업의 ' : '전체 '}최근 30일 공시 · 5분마다 갱신
        </p>
      </header>

      {important.length > 0 && (
        <section className="mt-6 border border-accent-burgundy/30 bg-accent-burgundy/5 p-4">
          <h2 className="font-serif font-bold text-accent-burgundy">중요 공시 ({important.length})</h2>
          <ul className="mt-2 space-y-1 font-sans text-sm">
            {important.slice(0, 5).map((d) => (
              <li key={d.rceptNo}>
                [{formatDate(d.rceptDt)}] {d.corpName} — {d.reportNm}
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading && <div className="mt-8"><TableSkeleton /></div>}
      {error && <p className="mt-4 text-accent-burgundy">{error}</p>}

      {!loading && disclosures.length === 0 && (
        <p className="mt-8 font-sans text-charcoal-gray">공시 데이터가 없습니다.</p>
      )}

      <ul className="mt-6 divide-y divide-charcoal/10 border border-charcoal/10">
        {disclosures.map((d) => (
          <li key={d.rceptNo} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2 font-sans text-sm">
              {d.isImportant && (
                <span className="bg-accent-burgundy px-2 py-0.5 text-xs text-white">중요</span>
              )}
              <span className="text-charcoal-gray">{formatDate(d.rceptDt)}</span>
              <Link to={`/company/${d.corpCode}`} className="font-medium text-accent-green hover:underline">
                {d.corpName}
              </Link>
              <span>{d.reportNm}</span>
            </div>
            {summaries[d.rceptNo] ? (
              <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal-gray">
                {summaries[d.rceptNo]}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => handleSummarize(d)}
                disabled={loadingSummary === d.rceptNo}
                className="mt-2 font-sans text-xs text-accent-green underline disabled:opacity-50"
              >
                {loadingSummary === d.rceptNo ? '요약 생성 중...' : 'AI 요약'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}
