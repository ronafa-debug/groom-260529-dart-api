export function formatNumber(value: number | null | undefined, unit = ''): string {
  if (value === null || value === undefined) return 'N/A';
  const abs = Math.abs(value);
  if (abs >= 1_0000_0000_0000) return `${(value / 1_0000_0000_0000).toFixed(1)}조${unit}`;
  if (abs >= 1_0000_0000) return `${(value / 1_0000_0000).toFixed(1)}억${unit}`;
  if (abs >= 1_0000) return `${(value / 1_0000).toFixed(1)}만${unit}`;
  return `${value.toLocaleString('ko-KR')}${unit}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(1)}%`;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(2);
}

export function formatDate(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}
