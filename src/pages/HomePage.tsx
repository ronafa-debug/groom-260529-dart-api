import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/ui/SearchBar';

export function HomePage() {
  return (
    <AppLayout>
      <section className="py-16 text-center">
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          AI 가치투자 분석
        </h1>
        <p className="mx-auto mt-4 max-w-lg font-sans text-charcoal-gray">
          대한민국 상장기업의 DART 재무 데이터를 Wall Street Journal 스타일로 분석합니다.
        </p>
        <div className="mx-auto mt-10 flex justify-center">
          <SearchBar autoFocus />
        </div>
      </section>

      <section className="mt-8 border-t border-charcoal/10 pt-8">
        <h2 className="mb-6 font-serif text-xl font-bold">주요 기능</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: '재무 분석', desc: 'PER, ROE, 부채비율 등 가치투자 지표 자동 계산' },
            { title: '기업 비교', desc: '2~4개 기업의 재무·성장·수익성을 한눈에 비교' },
            { title: 'AI 리포트', desc: 'GPT 기반 WSJ 스타일 투자 분석 리포트 생성' },
          ].map(({ title, desc }) => (
            <div key={title} className="border-l-2 border-accent-green pl-4">
              <h3 className="font-serif font-bold">{title}</h3>
              <p className="mt-1 font-sans text-sm text-charcoal-gray">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 text-center">
        <Link
          to="/disclosures"
          className="font-sans text-sm text-accent-green underline hover:text-accent-burgundy"
        >
          최근 공시 모니터링 보기 →
        </Link>
      </section>
    </AppLayout>
  );
}
