const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const inFlight = new Map<string, Promise<unknown>>();

const MEMORY_ONLY_KEYS = ['corp:list'];

function hasKvEnv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function shouldUseKv(key: string): boolean {
  return hasKvEnv() && !MEMORY_ONLY_KEYS.includes(key);
}

async function getKvClient() {
  if (!hasKvEnv()) return null;
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (shouldUseKv(key)) {
    try {
      const kv = await getKvClient();
      if (kv) return (await kv.get<T>(key)) ?? null;
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
  if (shouldUseKv(key)) {
    try {
      const kv = await getKvClient();
      if (kv) {
        await kv.set(key, value, { ex: ttlSeconds });
        return;
      }
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
