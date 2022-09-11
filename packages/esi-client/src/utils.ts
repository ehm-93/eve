import fetch, { RequestInit } from 'node-fetch';

import { Cache, CacheEntry } from './cache';

export async function fetchWithCache<T>(cache: Cache, url: string, options?: RequestInit): Promise<CacheEntry<T>> {
  const method = options?.method ?? 'GET';

  const entry = await cache.getOrDefault<T>({ method, url }, async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to ${ method } '${ url }': ${ response.status } - ${ response.statusText }`);
    }
    const headers = Object.fromEntries(Array(...response.headers.entries()).map(([key, val]) => [ key.toLowerCase(), val ]));
    const body: T = await response.json();

    const expires = response.headers.get('expires');
    const etag = response.headers.get('etag');
    if (!expires || !etag) {
      return { expires: new Date(0), headers, body };
    } else {
      return { expires: new Date(expires), headers, body };
    }
  });

  return entry;
}
