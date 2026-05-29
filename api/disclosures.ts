import { getDisclosures } from './_lib/dart';
import { getQueryParam, handleOptions, sendError, sendJson } from './_lib/handler';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const corpCode = getQueryParam(req.query.corpCode) ?? null;
  const days = Number(getQueryParam(req.query.days) ?? '30');

  try {
    const disclosures = await getDisclosures(corpCode, days);
    sendJson(res, disclosures);
  } catch (err) {
    sendError(res, 500, err instanceof Error ? err.message : 'Failed to fetch disclosures');
  }
}
