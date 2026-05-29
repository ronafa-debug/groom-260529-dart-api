import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import type { CorpCode } from '@/types';

const RECENT_KEY = 'wsv-recent-searches';

function getRecent(): CorpCode[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as CorpCode[];
  } catch {
    return [];
  }
}

function saveRecent(corp: CorpCode) {
  const recent = getRecent().filter((r) => r.corpCode !== corp.corpCode);
  recent.unshift(corp);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
}

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CorpCode[]>([]);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<CorpCode[]>([]);
  const debounced = useDebounce(query);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    companyApi.search(debounced).then(setResults).catch(() => setResults([]));
  }, [debounced]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(corp: CorpCode) {
    saveRecent(corp);
    setRecent(getRecent());
    setOpen(false);
    setQuery('');
    navigate(`/company/${corp.corpCode}`);
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <input
        type="text"
        autoFocus={autoFocus}
        placeholder="기업명 또는 종목코드 검색..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full border border-charcoal/20 bg-white px-4 py-3 font-sans text-charcoal placeholder:text-charcoal-gray/50 focus:border-accent-green focus:outline-none"
      />
      {open && (results.length > 0 || (query === '' && recent.length > 0)) && (
        <ul className="absolute z-50 mt-1 w-full border border-charcoal/10 bg-white shadow-lg">
          {query === '' && recent.length > 0 && (
            <>
              <li className="px-4 py-2 font-sans text-xs text-charcoal-gray">최근 검색</li>
              {recent.map((corp) => (
                <li key={corp.corpCode}>
                  <button
                    type="button"
                    onClick={() => select(corp)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left font-sans hover:bg-warm-off"
                  >
                    <span>{corp.corpName}</span>
                    <span className="text-sm text-charcoal-gray">{corp.stockCode}</span>
                  </button>
                </li>
              ))}
            </>
          )}
          {results.map((corp) => (
            <li key={corp.corpCode}>
              <button
                type="button"
                onClick={() => select(corp)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left font-sans hover:bg-warm-off"
              >
                <span>{corp.corpName}</span>
                <span className="text-sm text-charcoal-gray">{corp.stockCode}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
