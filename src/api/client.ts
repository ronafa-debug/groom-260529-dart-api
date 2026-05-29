import type {
  AnalyzeReport,
  CompareResponse,
  CorpCode,
  Disclosure,
  FinanceResponse,
} from '@/types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export interface CompanyDetail {
  corpCode: string;
  corpName: string;
  corpNameEng: string;
  stockCode: string;
  ceoNm: string;
  corpCls: string;
  jurirNo: string;
  bizrNo: string;
  adres: string;
  hmUrl: string;
  irUrl: string;
  phnNo: string;
  faxNo: string;
  indutyCode: string;
  estDt: string;
  accMt: string;
  recentDisclosures: Disclosure[];
}

export const companyApi = {
  get: (corpCode: string) =>
    request<CompanyDetail>(`/company?corpCode=${corpCode}`),
  search: (q: string) =>
    request<CorpCode[]>(`/company/search?q=${encodeURIComponent(q)}`),
};

export const financeApi = {
  get: (corpCode: string, years = 5) =>
    request<FinanceResponse>(`/finance?corpCode=${corpCode}&years=${years}`),
};

export const analyzeApi = {
  generate: (body: { corpCode: string; model?: string }) =>
    request<AnalyzeReport>('/analyze', { method: 'POST', body: JSON.stringify(body) }),
};

export const compareApi = {
  compare: (body: { corpCodes: string[]; includeNarrative?: boolean }) =>
    request<CompareResponse>('/compare', { method: 'POST', body: JSON.stringify(body) }),
};

export const disclosuresApi = {
  list: (corpCode?: string, days = 30) => {
    const params = new URLSearchParams({ days: String(days) });
    if (corpCode) params.set('corpCode', corpCode);
    return request<Disclosure[]>(`/disclosures?${params}`);
  },
  summarize: (body: { rceptNo: string; corpName: string; reportNm: string }) =>
    request<{ summary: string }>('/disclosures/summarize', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
