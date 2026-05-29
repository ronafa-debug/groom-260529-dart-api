import type { FinanceResponse } from '../../lib/types';

export function buildAnalyzePrompt(companyName: string, finance: FinanceResponse): string {
  return `당신은 월스트리트 투자 분석가입니다. 다음 기업의 재무 데이터를 분석해주세요.

기업명: ${companyName}

재무 데이터 (JSON):
${JSON.stringify(finance, null, 2)}

분석 항목:
1. 성장성 (growth)
2. 수익성 (profitability)
3. 안정성 (stability)
4. 경쟁력 (competitiveness)
5. 리스크 (risks)
6. 장기 투자 적합성 (longTermView)

톤:
- Wall Street Journal 스타일
- 전문적이고 차분한 어조
- 과장 금지
- 투자 권유 금지 (매수/매도 추천 금지)

필수 면책:
- "본 분석은 참고용이며, 투자 판단은 사용자 본인의 책임입니다."

다음 JSON 형식으로만 응답하세요:
{
  "headline": "한 줄 헤드라인",
  "executiveSummary": "핵심 요약 (2-3문장)",
  "growth": "성장성 분석",
  "profitability": "수익성 분석",
  "stability": "안정성 분석",
  "competitiveness": "경쟁력 분석",
  "risks": "리스크 요인",
  "longTermView": "장기 관점 평가"
}`;
}

export function buildComparePrompt(companies: Array<{ name: string; finance: FinanceResponse }>): string {
  const data = companies.map((c) => ({ name: c.name, finance: c.finance }));
  return `당신은 월스트리트 투자 분석가입니다. 다음 ${companies.length}개 기업을 가치투자 관점에서 비교 분석해주세요.

비교 데이터 (JSON):
${JSON.stringify(data, null, 2)}

분석 관점:
- 재무제표 비교
- 성장률 비교
- 수익성 비교
- 안정성 비교
- 현금흐름 비교

톤: Wall Street Journal 스타일, 전문적, 과장 금지, 투자 권유 금지.

다음 JSON 형식으로만 응답하세요:
{
  "narrative": "기업 비교 종합 해설 (4-6문단)"
}`;
}

export function buildDisclosureSummaryPrompt(corpName: string, reportNm: string, content: string): string {
  return `다음 공시를 Wall Street Journal 스타일로 3-4문장 요약해주세요. 투자 권유는 하지 마세요.

기업: ${corpName}
공시명: ${reportNm}
내용: ${content.slice(0, 4000)}

JSON 형식으로 응답:
{ "summary": "요약 텍스트" }`;
}

export const FORBIDDEN_PATTERNS = [
  /무조건\s*상승/,
  /매수\s*추천/,
  /확실한\s*투자/,
  /반드시\s*수익/,
];

export function sanitizeAiText(text: string): string {
  let result = text;
  for (const pattern of FORBIDDEN_PATTERNS) {
    result = result.replace(pattern, '[표현 제한]');
  }
  return result;
}

export const DISCLAIMER = '본 분석은 참고용이며, 투자 판단은 사용자 본인의 책임입니다.';
