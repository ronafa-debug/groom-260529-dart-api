import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchDartCorpCodeList } from '../api/_lib/corp-codes-fetch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outPath = resolve(root, 'api/_data/corp-codes.json');

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

async function main() {
  loadEnv();
  mkdirSync(dirname(outPath), { recursive: true });

  if (!process.env.DART_API_KEY?.trim()) {
    console.warn('DART_API_KEY not set — writing empty corp-codes.json');
    writeFileSync(outPath, '[]\n', 'utf8');
    return;
  }

  console.log('Fetching corp codes from DART...');
  const corps = await fetchDartCorpCodeList();
  writeFileSync(outPath, `${JSON.stringify(corps)}\n`, 'utf8');
  console.log(`Wrote ${corps.length} corp codes to api/_data/corp-codes.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
