import type { CorpCode, CompanyInfo, Disclosure } from '../../lib/types/index.js';
import { cacheGetOrSet } from './cache.js';
import { unzipSync } from 'fflate';

const DART_BASE = 'https://opendart.fss.or.kr/api';

function getApiKey(): string {
  const key = process.env.DART_API_KEY?.trim();
  if (!key) {
    throw new Error('DART_API_KEY is not configured. Vercel 환경변수에 DART API 인증키를 설정해주세요.');
  }
  return key;
}

function parseDartXmlError(text: string): string | null {
  if (!text.includes('<status>')) return null;
  const status = text.match(/<status>([^<]+)<\/status>/)?.[1];
  const message = text.match(/<message>([^<]+)<\/message>/)?.[1];
  if (status === '010') {
    return 'DART API 인증키가 올바르지 않습니다. Vercel 환경변수 DART_API_KEY를 확인해주세요.';
  }
  return message ? `DART error ${status}: ${message}` : `DART error ${status ?? 'unknown'}`;
}

async function fetchCorpCodeZip(): Promise<Uint8Array> {
  const url = new URL(`${DART_BASE}/corpCode.xml`);
  url.searchParams.set('crtfc_key', getApiKey());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`DART corpCode HTTP error: ${res.status}`);

  const buffer = new Uint8Array(await res.arrayBuffer());

  // Valid response is a ZIP archive (magic bytes: PK)
  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    return buffer;
  }

  const text = new TextDecoder('utf-8').decode(buffer);
  const dartError = parseDartXmlError(text);
  if (dartError) throw new Error(dartError);

  throw new Error('Unexpected DART corpCode response format');
}

async function dartFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${DART_BASE}/${path}`);
  url.searchParams.set('crtfc_key', getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`DART API error: ${res.status}`);

  const contentType = res.headers.get('content-type') ?? '';

  if (path.endsWith('.xml') && contentType.includes('zip')) {
    throw new Error('Unexpected ZIP response in dartFetch');
  }

  if (contentType.includes('json') || path.endsWith('.json')) {
    const data = await res.json() as T & { status?: string; message?: string };
    const status = (data as { status?: string }).status;
    if (status && status !== '000') {
      const d = data as { status: string; message?: string };
      if (d.status === '013') throw new Error('NO_DATA');
      throw new Error(d.message ?? `DART error ${d.status}`);
    }
    return data;
  }

  return res.text() as Promise<T>;
}

function parseCorpCodeXml(xml: string): CorpCode[] {
  const corps: CorpCode[] = [];
  const listRegex = /<list>([\s\S]*?)<\/list>/g;
  let match: RegExpExecArray | null;

  while ((match = listRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
      return m?.[1]?.trim() ?? '';
    };
    const stockCode = get('stock_code');
    if (!stockCode) continue;
    corps.push({
      corpCode: get('corp_code'),
      corpName: get('corp_name'),
      stockCode,
      modifyDate: get('modify_date'),
    });
  }

  return corps;
}

export async function getCorpCodeList(): Promise<CorpCode[]> {
  return cacheGetOrSet('corp:list', 86400, async () => {
    const buffer = await fetchCorpCodeZip();
    const files = unzipSync(buffer);
    const xmlFile = Object.keys(files).find((name) => name.toLowerCase().endsWith('.xml'));
    if (!xmlFile) throw new Error('CORPCODE.xml not found in ZIP');

    const xml = new TextDecoder('utf-8').decode(files[xmlFile]);
    return parseCorpCodeXml(xml);
  });
}

export async function searchCorps(query: string, limit = 10): Promise<CorpCode[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const list = await getCorpCodeList();
  return list
    .filter((c) =>
      c.corpName.toLowerCase().includes(q) ||
      c.stockCode.includes(q) ||
      c.corpCode.includes(q),
    )
    .slice(0, limit);
}

export async function getCompanyInfo(corpCode: string): Promise<CompanyInfo> {
  return cacheGetOrSet(`corp:${corpCode}`, 43200, async () => {
    const data = await dartFetch<{ corp_code: string; corp_name: string; corp_name_eng: string; stock_code: string; ceo_nm: string; corp_cls: string; jurir_no: string; bizr_no: string; adres: string; hm_url: string; ir_url: string; phn_no: string; fax_no: string; induty_code: string; est_dt: string; acc_mt: string }>(
      'company.json',
      { corp_code: corpCode },
    );
    return {
      corpCode: data.corp_code,
      corpName: data.corp_name,
      corpNameEng: data.corp_name_eng,
      stockCode: data.stock_code,
      ceoNm: data.ceo_nm,
      corpCls: data.corp_cls,
      jurirNo: data.jurir_no,
      bizrNo: data.bizr_no,
      adres: data.adres,
      hmUrl: data.hm_url,
      irUrl: data.ir_url,
      phnNo: data.phn_no,
      faxNo: data.fax_no,
      indutyCode: data.induty_code,
      estDt: data.est_dt,
      accMt: data.acc_mt,
    };
  });
}

interface DartAccountRow {
  bsns_year: string;
  account_nm: string;
  thstrm_amount: string;
  fs_div?: string;
  sj_div?: string;
}

export async function getFinancialStatements(corpCode: string, years = 5): Promise<DartAccountRow[]> {
  const currentYear = new Date().getFullYear();
  const allRows: DartAccountRow[] = [];

  for (let i = 0; i < years; i++) {
    const year = String(currentYear - i);
    const cacheKey = `finance:${corpCode}:${year}`;
    const rows = await cacheGetOrSet(cacheKey, 21600, async () => {
      try {
        const data = await dartFetch<{ list?: DartAccountRow[] }>(
          'fnlttSinglAcntAll.json',
          {
            corp_code: corpCode,
            bsns_year: year,
            reprt_code: '11011',
            fs_div: 'CFS',
          },
        );
        return data.list ?? [];
      } catch (err) {
        if (err instanceof Error && err.message === 'NO_DATA') return [];
        return [];
      }
    });
    allRows.push(...rows);
  }

  return allRows;
}

const IMPORTANT_KEYWORDS = [
  '유상증자', '자사주', '합병', '분할', '대규모', '공급계약', '단일판매',
  '투자', '지분', '최대주주', '임원', '배당',
];

export function isImportantDisclosure(reportNm: string): boolean {
  return IMPORTANT_KEYWORDS.some((kw) => reportNm.includes(kw));
}

export async function getDisclosures(corpCode: string | null, days = 30): Promise<Disclosure[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const bgnDe = start.toISOString().slice(0, 10).replace(/-/g, '');
  const endDe = end.toISOString().slice(0, 10).replace(/-/g, '');

  const cacheKey = corpCode ? `disclosures:${corpCode}:${days}` : `disclosures:all:${days}`;

  return cacheGetOrSet(cacheKey, 1800, async () => {
    const params: Record<string, string> = { bgn_de: bgnDe, end_de: endDe, page_count: '100' };
    if (corpCode) params.corp_code = corpCode;

    const data = await dartFetch<{ list?: Array<Record<string, string>> }>('list.json', params);
    const list = data.list ?? [];

    return list.map((item) => ({
      rceptNo: item.rcept_no ?? '',
      corpCode: item.corp_code ?? '',
      corpName: item.corp_name ?? '',
      stockCode: item.stock_code ?? '',
      corpCls: item.corp_cls ?? '',
      reportNm: item.report_nm ?? '',
      rceptDt: item.rcept_dt ?? '',
      flrNm: item.flr_nm ?? '',
      rm: item.rm ?? '',
      isImportant: isImportantDisclosure(item.report_nm ?? ''),
    }));
  });
}

export async function getDisclosureDocument(rceptNo: string): Promise<string> {
  return cacheGetOrSet(`disclosure:doc:${rceptNo}`, 3600, async () => {
    const url = new URL(`${DART_BASE}/document.xml`);
    url.searchParams.set('crtfc_key', getApiKey());
    url.searchParams.set('rcept_no', rceptNo);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Document fetch failed: ${res.status}`);
    const text = await res.text();
    return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
  });
}

export async function getCorpName(corpCode: string): Promise<string> {
  try {
    const info = await getCompanyInfo(corpCode);
    return info.corpName;
  } catch {
    const list = await getCorpCodeList();
    return list.find((c) => c.corpCode === corpCode)?.corpName ?? corpCode;
  }
}
