import { createServer, type IncomingMessage } from 'http';
import { parse } from 'url';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv(): void {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

const routes: Record<string, () => Promise<{ default: Handler }>> = {
  'GET /api/company': () => import('../api/company'),
  'GET /api/company/search': () => import('../api/company/search'),
  'GET /api/finance': () => import('../api/finance'),
  'POST /api/analyze': () => import('../api/analyze'),
  'POST /api/compare': () => import('../api/compare'),
  'GET /api/disclosures': () => import('../api/disclosures'),
  'POST /api/disclosures/summarize': () => import('../api/disclosures/summarize'),
};

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function createMockRes() {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let body = '';

  return {
    statusCode: () => statusCode,
    setHeader(k: string, v: string) { headers[k] = v; },
    status(code: number) { statusCode = code; return this; },
    json(data: unknown) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
      return this;
    },
    end(data?: string) {
      if (data) body = data;
      return this;
    },
    getResponse() {
      return { statusCode, headers, body };
    },
  };
}

const server = createServer(async (req, res) => {
  const { pathname, query } = parse(req.url ?? '', true);
  const method = req.method ?? 'GET';
  const key = `${method} ${pathname}`;

  const loader = routes[key];
  if (!loader) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  try {
    const mod = await loader();
    const mockRes = createMockRes();

    await mod.default(
      { method, query, body: method === 'POST' ? await readBody(req) : undefined } as VercelRequest,
      mockRes as unknown as VercelResponse,
    );

    const { statusCode, headers, body } = mockRes.getResponse();
    res.writeHead(statusCode, headers);
    res.end(body);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Dev API server running at http://localhost:${PORT}`);
});
