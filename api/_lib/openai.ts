import OpenAI from 'openai';
import { cacheGetOrSet } from './cache';
import {
  buildAnalyzePrompt,
  buildComparePrompt,
  buildDisclosureSummaryPrompt,
  DISCLAIMER,
  sanitizeAiText,
} from './prompts';
import type { AnalyzeReport, FinanceResponse } from '../../lib/types';

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error('OPENAI_API_KEY is not configured. Vercel 환경변수에 OpenAI API 키를 설정해주세요.');
  return new OpenAI({ apiKey: key });
}

function parseJsonFromResponse(content: string): Record<string, string> {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid AI response format');
  return JSON.parse(match[0]) as Record<string, string>;
}

export async function generateAnalyzeReport(
  companyName: string,
  finance: FinanceResponse,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
): Promise<AnalyzeReport> {
  const cacheKey = `analyze:${finance.corpCode}:${model}`;
  return cacheGetOrSet(cacheKey, 3600, async () => {
    const openai = getOpenAI();
    const prompt = buildAnalyzePrompt(companyName, finance);
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? '{}';
    const parsed = parseJsonFromResponse(content);

    return {
      headline: sanitizeAiText(parsed.headline ?? ''),
      executiveSummary: sanitizeAiText(parsed.executiveSummary ?? ''),
      growth: sanitizeAiText(parsed.growth ?? ''),
      profitability: sanitizeAiText(parsed.profitability ?? ''),
      stability: sanitizeAiText(parsed.stability ?? ''),
      competitiveness: sanitizeAiText(parsed.competitiveness ?? ''),
      risks: sanitizeAiText(parsed.risks ?? ''),
      longTermView: sanitizeAiText(parsed.longTermView ?? ''),
      disclaimer: DISCLAIMER,
      generatedAt: new Date().toISOString(),
    };
  });
}

export async function generateCompareNarrative(
  companies: Array<{ name: string; finance: FinanceResponse }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
): Promise<string> {
  const codes = companies.map((c) => c.finance.corpCode).sort().join('-');
  const cacheKey = `compare:narrative:${codes}:${model}`;

  return cacheGetOrSet(cacheKey, 3600, async () => {
    const openai = getOpenAI();
    const prompt = buildComparePrompt(companies);
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? '{}';
    const parsed = parseJsonFromResponse(content);
    return sanitizeAiText(parsed.narrative ?? '');
  });
}

export async function generateDisclosureSummary(
  corpName: string,
  reportNm: string,
  content: string,
): Promise<string> {
  const cacheKey = `disclosure:summary:${corpName}:${reportNm}`.slice(0, 200);
  return cacheGetOrSet(cacheKey, 3600, async () => {
    const openai = getOpenAI();
    const prompt = buildDisclosureSummaryPrompt(corpName, reportNm, content);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = parseJsonFromResponse(raw);
    return sanitizeAiText(parsed.summary ?? '');
  });
}
