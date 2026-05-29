export async function getMarketCap(stockCode: string): Promise<number | null> {
  if (!stockCode || stockCode.length !== 6) return null;

  try {
    const symbol = `${stockCode}.KS`;
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;

    const data = await res.json() as {
      quoteSummary?: { result?: Array<{ price?: { marketCap?: { raw?: number } } }> };
    };
    return data.quoteSummary?.result?.[0]?.price?.marketCap?.raw ?? null;
  } catch {
    return null;
  }
}
