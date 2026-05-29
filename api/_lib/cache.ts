import { kv } from '@vercel/kv';

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const inFlight = new Map<string, Promise<unknown>>();

function hasKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (hasKv()) {
    try {
      return (await kv.get<T>(key)) ?? null;
    } catch {
      // fall through to memory
    }
  }

  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (hasKv()) {
    try {
      await kv.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // fall through to memory
    }
  }

  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = (async () => {
    const value = await fetcher();
    await cacheSet(key, value, ttlSeconds);
    return value;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}
