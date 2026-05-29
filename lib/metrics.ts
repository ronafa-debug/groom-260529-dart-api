import type { FinancialStatement, ValueMetrics } from './types/index.js';

function safeDivide(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

function growthRate(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function calculateMetrics(
  statements: FinancialStatement[],
  marketCap: number | null = null,
): ValueMetrics[] {
  const sorted = [...statements].sort((a, b) => Number(a.year) - Number(b.year));

  return sorted.map((stmt, index) => {
    const prev = index > 0 ? sorted[index - 1] : null;
    const equity = stmt.totalEquity ?? (stmt.totalAssets !== null && stmt.totalLiabilities !== null
      ? stmt.totalAssets - stmt.totalLiabilities
      : null);

    return {
      year: stmt.year,
      per: marketCap && stmt.netIncome ? safeDivide(marketCap, stmt.netIncome) : null,
      pbr: marketCap && equity ? safeDivide(marketCap, equity) : null,
      roe: safeDivide(stmt.netIncome, equity) !== null
        ? (safeDivide(stmt.netIncome, equity)! * 100)
        : null,
      roa: safeDivide(stmt.netIncome, stmt.totalAssets) !== null
        ? (safeDivide(stmt.netIncome, stmt.totalAssets)! * 100)
        : null,
      debtRatio: safeDivide(stmt.totalLiabilities, equity) !== null
        ? (safeDivide(stmt.totalLiabilities, equity)! * 100)
        : null,
      operatingMargin: safeDivide(stmt.operatingIncome, stmt.revenue) !== null
        ? (safeDivide(stmt.operatingIncome, stmt.revenue)! * 100)
        : null,
      revenueGrowth: growthRate(stmt.revenue, prev?.revenue ?? null),
      epsGrowth: growthRate(stmt.netIncome, prev?.netIncome ?? null),
    };
  }).reverse();
}
