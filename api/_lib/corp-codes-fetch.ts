import type { CorpCode } from '../../lib/types/index.js';
import { unzipSync } from 'fflate';

const DART_BASE = 'https://opendart.fss.or.kr/api';

export function getDartApiKey(): string {
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

export function parseCorpCodeXml(xml: string): CorpCode[] {
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

export async function fetchDartCorpCodeList(): Promise<CorpCode[]> {
  const url = new URL(`${DART_BASE}/corpCode.xml`);
  url.searchParams.set('crtfc_key', getDartApiKey());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`DART corpCode HTTP error: ${res.status}`);

  const buffer = new Uint8Array(await res.arrayBuffer());

  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    const files = unzipSync(buffer);
    const xmlFile = Object.keys(files).find((name) => name.toLowerCase().endsWith('.xml'));
    if (!xmlFile) throw new Error('CORPCODE.xml not found in ZIP');
    const xml = new TextDecoder('utf-8').decode(files[xmlFile]);
    return parseCorpCodeXml(xml);
  }

  const text = new TextDecoder('utf-8').decode(buffer);
  const dartError = parseDartXmlError(text);
  if (dartError) throw new Error(dartError);

  throw new Error('Unexpected DART corpCode response format');
}
