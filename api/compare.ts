import { getCompanyInfo, getFinancialStatements } from './_lib/dart';
import { getMarketCap } from './_lib/market';
import { generateCompareNarrative } from './_lib/openai';
import { handleOptions, handleApiError, sendError, sendJson } from './_lib/handler';
import { normalizeFinancialData, mergeYearlyStatements } from '../lib/normalize';
import { calculateMetrics } from '../lib/metrics';
import type { CompareRequest, CompareResponse } from '../lib/types';
import type { VercelRequest, VercelResponse } from '@vercel/node';

async function fetchCompanyFinance(corpCode: string) {
  const [rows, company] = await Promise.all([
    getFinancialStatements(corpCode, 5),
    getCompanyInfo(corpCode),
  ]);
  const statements = mergeYearlyStatements(normalizeFinancialData(rows));
  const marketCap = await getMarketCap(company.stockCode);
  return {
    corpCode,
    corpName: company.corpName,
    stockCode: company.stockCode,
    finance: {
      corpCode,
      statements,
      metrics: calculateMetrics(statements, marketCap),
      marketCap,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const body = req.body as CompareRequest;
    const corpCodes = body.corpCodes?.filter(Boolean) ?? [];

    if (corpCodes.length < 2 || corpCodes.length > 4) {
      return sendError(res, 400, 'Provide 2 to 4 corpCodes');
    }

    const companies = await Promise.all(corpCodes.map(fetchCompanyFinance));

    const response: CompareResponse = { companies };

    if (body.includeNarrative) {
      response.narrative = await generateCompareNarrative(
        companies.map((c) => ({ name: c.corpName, finance: c.finance })),
        body.model ?? 'gpt-4o-mini',
      );
    }

    sendJson(res, response);
  } catch (err) {
    handleApiError(res, err, 'Compare failed');
  }
}
