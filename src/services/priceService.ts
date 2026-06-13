import type { IPriceProvider, PriceResult } from './priceProvider';
import { yahooFinanceProvider } from './yahooFinanceProvider';

interface CacheEntry {
  result: PriceResult;
  expiresAt: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class PriceService {
  private cache = new Map<string, CacheEntry>();
  private provider: IPriceProvider;

  constructor(provider: IPriceProvider = yahooFinanceProvider) {
    this.provider = provider;
  }

  async fetchPrice(ticker: string): Promise<PriceResult | null> {
    const cached = this.cache.get(ticker);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const result = await this.provider.fetchPrice(ticker);
    if (result) {
      this.cache.set(ticker, { result, expiresAt: Date.now() + CACHE_TTL });
    }
    return result;
  }

  async fetchPrices(tickers: string[]): Promise<PriceResult[]> {
    const uncached: string[] = [];
    const results: PriceResult[] = [];

    for (const ticker of tickers) {
      const cached = this.cache.get(ticker);
      if (cached && cached.expiresAt > Date.now()) {
        results.push(cached.result);
      } else {
        uncached.push(ticker);
      }
    }

    if (uncached.length > 0) {
      const fetched = await this.provider.fetchPrices(uncached);
      for (const result of fetched) {
        this.cache.set(result.ticker, {
          result,
          expiresAt: Date.now() + CACHE_TTL,
        });
        results.push(result);
      }
    }

    return results;
  }

  getCachedPrice(ticker: string): number | null {
    const entry = this.cache.get(ticker);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.result.price;
    }
    return null;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const priceService = new PriceService();
