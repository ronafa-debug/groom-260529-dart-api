import { Link } from 'react-router-dom';
import { useCompareStore } from '@/store/useCompareStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const count = useCompareStore((s) => s.items.length);

  return (
    <div className="min-h-screen bg-warm-white text-charcoal">
      <header className="border-b border-charcoal/10 bg-warm-off">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-accent-green">
            WallStreet Value
          </Link>
          <nav className="flex items-center gap-6 font-sans text-sm">
            <Link to="/" className="hover:text-accent-green transition-colors">
              검색
            </Link>
            <Link to="/compare" className="hover:text-accent-green transition-colors">
              기업 비교 {count > 0 && <span className="text-accent-burgundy">({count})</span>}
            </Link>
            <Link to="/disclosures" className="hover:text-accent-green transition-colors">
              공시
            </Link>
          </nav>
        </div>
        <div className="border-t border-charcoal/5 bg-warm-beige/30">
          <p className="mx-auto max-w-6xl px-6 py-1.5 font-sans text-xs text-charcoal-gray">
            AI 기반 가치투자 분석 · 참고용 정보 제공
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      <footer className="mt-16 border-t border-charcoal/10 py-6">
        <p className="mx-auto max-w-6xl px-6 text-center font-sans text-xs text-charcoal-gray">
          © {new Date().getFullYear()} WallStreet Value · 본 서비스는 투자 자문이 아닙니다.
        </p>
      </footer>
    </div>
  );
}
