import type { ViolationRaw } from '../types/violation';

const CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheEntry {
  data: ViolationRaw[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCached(key: string): ViolationRaw[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: ViolationRaw[]): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
