import { getFinancialStatements, getCompanyInfo } from './_lib/dart';
import { getMarketCap } from './_lib/market';
import { getQueryParam, handleOptions, handleApiError, sendError, sendJson } from './_lib/handler';
import { normalizeFinancialData, mergeYearlyStatements } from '../lib/normalize';
import { calculateMetrics } from '../lib/metrics';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const corpCode = getQueryParam(req.query.corpCode);
  if (!corpCode) {
    return sendError(res, 400, 'corpCode is required');
  }

  const years = Number(getQueryParam(req.query.years) ?? '5');

  try {
    const [rows, company] = await Promise.all([
      getFinancialStatements(corpCode, years),
      getCompanyInfo(corpCode),
    ]);

    const statements = mergeYearlyStatements(normalizeFinancialData(rows));
    const marketCap = await getMarketCap(company.stockCode);
    const metrics = calculateMetrics(statements, marketCap);

    sendJson(res, {
      corpCode,
      statements,
      metrics,
      marketCap,
    });
  } catch (err) {
    handleApiError(res, err, 'Failed to fetch finance data');
  }
}
