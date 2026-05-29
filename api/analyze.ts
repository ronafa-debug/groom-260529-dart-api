import { getCompanyInfo, getFinancialStatements } from './_lib/dart';
import { getMarketCap } from './_lib/market';
import { generateAnalyzeReport } from './_lib/openai';
import { handleOptions, sendError, sendJson } from './_lib/handler';
import { normalizeFinancialData, mergeYearlyStatements } from '../src/utils/normalize';
import { calculateMetrics } from '../src/utils/metrics';
import type { AnalyzeRequest } from '../src/types';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const body = req.body as AnalyzeRequest;
    if (!body.corpCode) {
      return sendError(res, 400, 'corpCode is required');
    }

    let finance = body.financialData;
    let companyName = body.company;

    if (!finance) {
      const [rows, company] = await Promise.all([
        getFinancialStatements(body.corpCode, 5),
        getCompanyInfo(body.corpCode),
      ]);
      const statements = mergeYearlyStatements(normalizeFinancialData(rows));
      const marketCap = await getMarketCap(company.stockCode);
      finance = {
        corpCode: body.corpCode,
        statements,
        metrics: calculateMetrics(statements, marketCap),
        marketCap,
      };
      companyName = company.corpName;
    }

    const report = await generateAnalyzeReport(
      companyName ?? body.corpCode,
      finance,
      body.model ?? 'gpt-4o-mini',
    );

    sendJson(res, report);
  } catch (err) {
    sendError(res, 500, err instanceof Error ? err.message : 'Analysis failed');
  }
}
