import { Cache } from '../cache';
import { Page } from '../types';
import { fetchWithCache } from '../utils';

export interface MarketHistory {
  average: number;
  data: string;
  highest: number;
  lowest: number;
  order_count: number;
  volume: number;
}

export type MarketOrderRange = 'station' | 'region' | 'solarsystem' | '1' | '2' | '3' | '4' | '5' | '10' | '20' | '30' | '40';

export interface MarketOrder {
  duration: number;
  is_buy_order: boolean;
  issued: string;
  location_id: number;
  min_volume: number;
  order_id: number;
  price: number;
  range: MarketOrderRange;
  system_id: number;
  type_id: number;
  volume_remain: number;
  volume_total: number;
}

export class MarketApi {
  constructor(
    private readonly config: {
      baseUri: string;
    },
    private readonly cache: Cache,
  ) { }

  async history(params: { typeId: number, regionId: number }): Promise<Page<MarketHistory>> {
    const res = await fetchWithCache<MarketHistory[]>(
      this.cache,
      `${ this.config.baseUri }/v1/markets/${ params.regionId }/history?type_id=${ params.typeId }`
    );
    return {
      items: await res.body,
      hasNext: false,
      next: () => Promise.reject(new Error('You only get one page of history.')),
    };
  }

  async orders(params: {
    regionId: number,
    orderType: 'buy' | 'sell' | 'all',
    page?: number,
    typeId?: number,
  }): Promise<Page<MarketOrder>> {
    const page = params.page ?? 1;
    let url = `${ this.config.baseUri }/v1/markets/${ params.regionId }/orders/?order_type=${ params.orderType }&page=${ page }`;
    if (params.typeId) url += `&type_id=${ params.typeId }`;
    const res = await fetchWithCache<MarketOrder[]>(this.cache, url);
    const pages = Number(res.headers['x-pages']);
    return {
      items: res.body,
      hasNext: page < pages,
      next: () => this.orders({ ...params, page: page + 1 }),
    };
  }

  async types(params: { regionId: number, page?: number }): Promise<Page<number>> {
    const page = params.page ?? 1;
    const url = `${ this.config.baseUri }/v1/markets/${ params.regionId }/types/?page=${ params.page }`;
    const res = await fetchWithCache<number[]>(this.cache, url);
    const pages = Number(res.headers['x-pages']);
    return {
      items: res.body,
      hasNext: page < pages,
      next: () => this.types({ ...params, page: page + 1 }),
    };
  }
}
