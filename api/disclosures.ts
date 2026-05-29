import { getDisclosures } from './_lib/dart.js';
import { getQueryParam, handleOptions, handleApiError, sendError, sendJson } from './_lib/handler.js';
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
    handleApiError(res, err, 'Failed to fetch disclosures');
  }
}
