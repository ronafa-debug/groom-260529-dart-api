import { Disclaimer } from '@/components/ui/Disclaimer';
import type { AnalyzeReport } from '@/types';

interface Props {
  report: AnalyzeReport;
}

export function ReportLayout({ report }: Props) {
  const sections = [
    { title: 'Executive Summary', content: report.executiveSummary },
    { title: '성장성', content: report.growth },
    { title: '수익성', content: report.profitability },
    { title: '안정성', content: report.stability },
    { title: '경쟁력', content: report.competitiveness },
    { title: '리스크', content: report.risks },
    { title: '장기 관점', content: report.longTermView },
  ];

  return (
    <article className="border-t-4 border-charcoal pt-6">
      <header className="mb-8 border-b border-charcoal/10 pb-6">
        <p className="font-sans text-xs uppercase tracking-widest text-accent-green">
          Investment Analysis Report
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
          {report.headline}
        </h1>
        <p className="mt-3 font-sans text-sm text-charcoal-gray">
          {new Date(report.generatedAt).toLocaleString('ko-KR')}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="mb-3 border-b border-charcoal/20 pb-1 font-serif text-xl font-bold">
                {title}
              </h2>
              <p className="font-sans text-base leading-relaxed text-charcoal-gray whitespace-pre-line">
                {content}
              </p>
            </section>
          ))}
        </div>
        <aside className="space-y-4">
          <Disclaimer />
          <div className="border border-charcoal/10 p-4">
            <h3 className="font-serif text-sm font-bold">About This Report</h3>
            <p className="mt-2 font-sans text-xs leading-relaxed text-charcoal-gray">
              본 리포트는 DART 공시 재무 데이터를 기반으로 AI가 생성한 참고용 분석입니다.
              Wall Street Journal 스타일의 객관적 서술을 지향합니다.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
