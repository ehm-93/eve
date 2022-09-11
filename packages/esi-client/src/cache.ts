import * as crypto from 'node:crypto';
import { TextEncoder } from 'node:util';

export interface CacheKey {
  method: string,
  url: string,
  headers?: { [ key: string ]: string },
}

export interface CacheEntry<T> {
  expires: Date;
  headers: { [ key: string ]: string };
  body: T;
}

export interface Cache {
  get<T>(key: CacheKey): Promise<CacheEntry<T> | undefined>;
  getOrDefault<T>(key: CacheKey, provider: () => Promise<CacheEntry<T>>): Promise<CacheEntry<T>>;
  set(key: CacheKey, entry: CacheEntry<unknown>): Promise<void>;
}

export abstract class AbstractCache implements Cache {
  async getOrDefault<T>(key: CacheKey, provider: () => Promise<CacheEntry<T>>): Promise<CacheEntry<T>> {
    const entry = await this.get<T>(key);
    if (entry) {
      return entry;
    }
    const newEntry = await provider();
    this.set(key, newEntry);
    return newEntry;
  }

  abstract get<T>(key: CacheKey): Promise<CacheEntry<T> | undefined>;
  abstract set(key: CacheKey, entry: CacheEntry<unknown>): Promise<void>;
}

export class MemoryCache extends AbstractCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly cache: { [ key: string ]: CacheEntry<any> } = { };

  async get<T>(key: CacheKey): Promise<CacheEntry<T> | undefined> {
    const keyStr = await hash(key);
    const result = this.cache[keyStr];
    if (!result) {
      return undefined;
    }
    if (result.expires.getTime() < Date.now()) {
      delete this.cache[keyStr];
      return undefined;
    }
    return result;
  }

  async set(key: CacheKey, entry: CacheEntry<unknown>): Promise<void> {
    this.cache[await hash(key)] = entry;
  }
}

async function hash(value: CacheKey): Promise<string> {
  const str = value.method + value.url + Object.entries(value.headers ?? {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(it => it.join())
    .join();

  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-1', encoder.encode(str));
  return Buffer.from(buf).toString('base64');
}
