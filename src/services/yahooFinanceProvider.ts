import type { IPriceProvider, PriceResult } from './priceProvider';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

export class YahooFinanceProvider implements IPriceProvider {
  private controller = new AbortController();

  async fetchPrice(ticker: string): Promise<PriceResult | null> {
    const results = await this.fetchPrices([ticker]);
    return results[0] ?? null;
  }

  async fetchPrices(tickers: string[]): Promise<PriceResult[]> {
    const results: PriceResult[] = [];
    const now = Date.now();

    for (const ticker of tickers) {
      try {
        const url = `${YAHOO_BASE}/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          results.push(null as any);
          continue;
        }

        const json = await response.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          results.push({
            ticker,
            price: meta.regularMarketPrice,
            currency: meta.currency ?? 'EUR',
            fetchedAt: now,
          });
        } else {
          results.push(null as any);
        }
      } catch {
        results.push(null as any);
      }
    }

    return results.filter(Boolean);
  }

  cancel() {
    this.controller.abort();
    this.controller = new AbortController();
  }
}

export const yahooFinanceProvider = new YahooFinanceProvider();
