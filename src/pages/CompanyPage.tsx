import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { ProfitabilityChart } from '@/components/charts/ProfitabilityChart';
import { BalanceSheetChart } from '@/components/charts/BalanceSheetChart';
import { FinancialTable } from '@/components/ui/FinancialTable';
import { MetricsGrid } from '@/components/ui/MetricsGrid';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { companyApi, type CompanyDetail, financeApi } from '@/api/client';
import { useCompareStore } from '@/store/useCompareStore';
import type { FinanceResponse } from '@/types';
import { formatDate, formatNumber } from '@/utils/format';

export function CompanyPage() {
  const { corpCode } = useParams<{ corpCode: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [finance, setFinance] = useState<FinanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { add, has, items } = useCompareStore();

  useEffect(() => {
    if (!corpCode) return;
    setLoading(true);
    setError('');
    Promise.all([
      companyApi.get(corpCode),
      financeApi.get(corpCode),
    ])
      .then(([c, f]) => { setCompany(c); setFinance(f); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [corpCode]);

  function handleAddCompare() {
    if (!company) return;
    add({ corpCode: company.corpCode, corpName: company.corpName, stockCode: company.stockCode });
  }

  if (loading) {
    return (
      <AppLayout>
        <TableSkeleton />
      </AppLayout>
    );
  }

  if (error || !company) {
    return (
      <AppLayout>
        <p className="text-accent-burgundy">{error || '기업 정보를 불러올 수 없습니다.'}</p>
      </AppLayout>
    );
  }

  const inCompare = has(company.corpCode);

  return (
    <AppLayout>
      <header className="border-b-2 border-charcoal pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-sm text-charcoal-gray">
              {company.stockCode} · {company.corpCls === 'Y' ? 'KOSPI' : company.corpCls === 'K' ? 'KOSDAQ' : '상장'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">{company.corpName}</h1>
            <p className="mt-2 font-sans text-sm text-charcoal-gray">
              {company.adres} · 설립 {formatDate(company.estDt)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddCompare}
              disabled={inCompare || items.length >= 4}
              className="border border-charcoal/20 px-4 py-2 font-sans text-sm hover:bg-warm-off disabled:opacity-40"
            >
              {inCompare ? '비교 목록에 있음' : '비교 추가'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/report/${company.corpCode}`)}
              className="bg-accent-green px-4 py-2 font-sans text-sm text-warm-white hover:bg-accent-green/90"
            >
              AI 리포트 생성
            </button>
          </div>
        </div>
        {finance?.marketCap && (
          <p className="mt-4 font-serif text-lg">
            시가총액 <strong>{formatNumber(finance.marketCap)}</strong>
          </p>
        )}
      </header>

      {finance && finance.metrics.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-serif text-xl font-bold">가치투자 지표</h2>
          <MetricsGrid metrics={finance.metrics} />
        </section>
      )}

      {finance && finance.statements.length > 0 && (
        <>
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-bold">재무 추이</h2>
            <RevenueChart statements={finance.statements} />
          </section>
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-bold">수익성 지표</h2>
            <ProfitabilityChart metrics={finance.metrics} />
          </section>
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-bold">재무상태</h2>
            <BalanceSheetChart statements={finance.statements} />
          </section>
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-bold">재무제표</h2>
            <FinancialTable statements={finance.statements} />
          </section>
        </>
      )}

      {company.recentDisclosures?.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">최근 공시</h2>
            <Link to={`/disclosures?corpCode=${company.corpCode}`} className="font-sans text-sm text-accent-green underline">
              전체 보기
            </Link>
          </div>
          <ul className="divide-y divide-charcoal/10 border border-charcoal/10">
            {company.recentDisclosures.slice(0, 5).map((d) => (
              <li key={d.rceptNo} className="flex items-center gap-3 px-4 py-3 font-sans text-sm">
                {d.isImportant && (
                  <span className="shrink-0 bg-accent-burgundy px-2 py-0.5 text-xs text-white">중요</span>
                )}
                <span className="shrink-0 text-charcoal-gray">{formatDate(d.rceptDt)}</span>
                <span>{d.reportNm}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppLayout>
  );
}
