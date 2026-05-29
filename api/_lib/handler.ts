import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function sendError(res: VercelResponse, status: number, message: string): void {
  setCors(res);
  res.status(status).json({ error: message });
}

export function sendJson<T>(res: VercelResponse, data: T, status = 200): void {
  setCors(res);
  res.status(status).json(data);
}

export function getQueryParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function mapErrorStatus(message: string): number {
  if (message.includes('DART_API_KEY')) return 503;
  if (message.includes('OPENAI_API_KEY')) return 503;
  if (message.includes('인증키')) return 503;
  if (message.includes('DART error 010')) return 503;
  return 500;
}

export function handleApiError(res: VercelResponse, err: unknown, fallback = 'Request failed'): void {
  const message = err instanceof Error ? err.message : fallback;
  sendError(res, mapErrorStatus(message), message);
}
