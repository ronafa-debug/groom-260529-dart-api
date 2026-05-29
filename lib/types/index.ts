export interface CorpCode {
  corpCode: string;
  corpName: string;
  stockCode: string;
  modifyDate: string;
}

export interface CompanyInfo {
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
}

export interface FinancialStatement {
  year: string;
  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  operatingCashFlow: number | null;
}

export interface ValueMetrics {
  year: string;
  per: number | null;
  pbr: number | null;
  roe: number | null;
  roa: number | null;
  debtRatio: number | null;
  operatingMargin: number | null;
  revenueGrowth: number | null;
  epsGrowth: number | null;
}

export interface FinanceResponse {
  corpCode: string;
  statements: FinancialStatement[];
  metrics: ValueMetrics[];
  marketCap: number | null;
}

export interface Disclosure {
  rceptNo: string;
  corpCode: string;
  corpName: string;
  stockCode: string;
  corpCls: string;
  reportNm: string;
  rceptDt: string;
  flrNm: string;
  rm: string;
  isImportant: boolean;
}

export interface AnalyzeRequest {
  corpCode: string;
  company?: string;
  financialData?: FinanceResponse;
  model?: 'gpt-4o' | 'gpt-4o-mini';
}

export interface AnalyzeReport {
  headline: string;
  executiveSummary: string;
  growth: string;
  profitability: string;
  stability: string;
  competitiveness: string;
  risks: string;
  longTermView: string;
  disclaimer: string;
  generatedAt: string;
}

export interface CompareRequest {
  corpCodes: string[];
  includeNarrative?: boolean;
  model?: 'gpt-4o' | 'gpt-4o-mini';
}

export interface CompareCompanyData {
  corpCode: string;
  corpName: string;
  stockCode: string;
  finance: FinanceResponse;
}

export interface CompareResponse {
  companies: CompareCompanyData[];
  narrative?: string;
}
