import { searchCorps } from '../_lib/dart.js';
import { getQueryParam, handleOptions, handleApiError, sendError, sendJson } from '../_lib/handler.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const q = getQueryParam(req.query.q);
  if (!q || q.length < 1) {
    return sendJson(res, []);
  }

  try {
    const results = await searchCorps(q, 10);
    sendJson(res, results);
  } catch (err) {
    handleApiError(res, err, 'Search failed');
  }
}
