import { getCompanyInfo, getDisclosures } from './_lib/dart';
import { getQueryParam, handleOptions, sendError, sendJson } from './_lib/handler';
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

  try {
    const [company, disclosures] = await Promise.all([
      getCompanyInfo(corpCode),
      getDisclosures(corpCode, 30),
    ]);

    sendJson(res, {
      ...company,
      recentDisclosures: disclosures.slice(0, 10),
    });
  } catch (err) {
    sendError(res, 500, err instanceof Error ? err.message : 'Failed to fetch company');
  }
}
