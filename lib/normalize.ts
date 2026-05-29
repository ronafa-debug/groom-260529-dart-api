import type { FinancialStatement } from './types';

const ACCOUNT_ALIASES: Record<keyof Omit<FinancialStatement, 'year'>, string[]> = {
  revenue: ['매출액', '수익(매출액)', '영업수익', '매출', 'Revenue'],
  operatingIncome: ['영업이익', '영업이익(손실)', 'Operating Income'],
  netIncome: ['당기순이익', '당기순이익(손실)', '분기순이익', 'Net Income'],
  totalAssets: ['자산총계', 'Total Assets'],
  totalLiabilities: ['부채총계', 'Total Liabilities'],
  totalEquity: ['자본총계', 'Total Equity'],
  operatingCashFlow: ['영업활동현금흐름', '영업활동으로인한현금흐름', 'Operating Cash Flow'],
};

interface DartAccountRow {
  bsns_year: string;
  account_nm: string;
  thstrm_amount: string;
  fs_div?: string;
  sj_div?: string;
}

function parseAmount(value: string | undefined): number | null {
  if (!value || value === '-' || value.trim() === '') return null;
  const cleaned = value.replace(/,/g, '').trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function matchAccount(accountName: string, aliases: string[]): boolean {
  const normalized = accountName.replace(/\s/g, '');
  return aliases.some((alias) => normalized.includes(alias.replace(/\s/g, '')));
}

function pickAmount(rows: DartAccountRow[], field: keyof typeof ACCOUNT_ALIASES): number | null {
  const aliases = ACCOUNT_ALIASES[field];
  const match = rows.find((row) => matchAccount(row.account_nm, aliases));
  return parseAmount(match?.thstrm_amount);
}

export function normalizeFinancialData(rows: DartAccountRow[]): FinancialStatement[] {
  const byYear = new Map<string, DartAccountRow[]>();

  for (const row of rows) {
    if (row.fs_div && row.fs_div !== 'CFS') continue;
    const year = row.bsns_year;
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(row);
  }

  return Array.from(byYear.entries())
    .map(([year, yearRows]) => ({
      year,
      revenue: pickAmount(yearRows, 'revenue'),
      operatingIncome: pickAmount(yearRows, 'operatingIncome'),
      netIncome: pickAmount(yearRows, 'netIncome'),
      totalAssets: pickAmount(yearRows, 'totalAssets'),
      totalLiabilities: pickAmount(yearRows, 'totalLiabilities'),
      totalEquity: pickAmount(yearRows, 'totalEquity'),
      operatingCashFlow: pickAmount(yearRows, 'operatingCashFlow'),
    }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}

export function mergeYearlyStatements(statements: FinancialStatement[]): FinancialStatement[] {
  const map = new Map<string, FinancialStatement>();

  for (const stmt of statements) {
    const existing = map.get(stmt.year);
    if (!existing) {
      map.set(stmt.year, { ...stmt });
      continue;
    }
    map.set(stmt.year, {
      year: stmt.year,
      revenue: existing.revenue ?? stmt.revenue,
      operatingIncome: existing.operatingIncome ?? stmt.operatingIncome,
      netIncome: existing.netIncome ?? stmt.netIncome,
      totalAssets: existing.totalAssets ?? stmt.totalAssets,
      totalLiabilities: existing.totalLiabilities ?? stmt.totalLiabilities,
      totalEquity: existing.totalEquity ?? stmt.totalEquity,
      operatingCashFlow: existing.operatingCashFlow ?? stmt.operatingCashFlow,
    });
  }

  return Array.from(map.values()).sort((a, b) => Number(b.year) - Number(a.year));
}
