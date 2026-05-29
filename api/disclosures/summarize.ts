import { getDisclosureDocument } from '../_lib/dart';
import { generateDisclosureSummary } from '../_lib/openai';
import { handleOptions, handleApiError, sendError, sendJson } from '../_lib/handler';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const { rceptNo, corpName, reportNm } = req.body as {
      rceptNo?: string;
      corpName?: string;
      reportNm?: string;
    };

    if (!rceptNo || !corpName || !reportNm) {
      return sendError(res, 400, 'rceptNo, corpName, and reportNm are required');
    }

    const content = await getDisclosureDocument(rceptNo);
    const summary = await generateDisclosureSummary(corpName, reportNm, content);

    sendJson(res, { summary });
  } catch (err) {
    handleApiError(res, err, 'Summary failed');
  }
}
