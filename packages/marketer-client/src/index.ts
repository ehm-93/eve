import fetch from 'node-fetch';

export interface MarketStats {
  buy: Stats,
  sell: Stats,
}

export interface Stats {
  max: number,
  media: number,
  generated: number,
  variance: number,
  min: number,
  avg: number,
  stdDev: number,
  fivePercent: number,
  highToLow: boolean,
  volume: number,
  wavg: number,
  forQuery: Query,
}

export interface Query {
  bid: boolean,
  types: number[],
  regions: number[],
  systems: number[],
  hours: number,
  minq: number,
}

export class MarketerApi {
  async getMarketStats(typeIds: number[], params?: { regionlimit?: number, usesystem?: number }): Promise<MarketStats[]> {
    let query = typeIds.map(it => `typeid=${ it }`).join('&');

    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        query += `&${ k }=${ v }`
      );
    }

    const response = await fetch(`https://api.evemarketer.com/ec/marketstat/json?${ query }`);

    if (!response.ok) {
      throw new Error(`Invocation of ${ response.url } failed with error ${ response.status }.`);
    }

    return response.json();
  }
}
