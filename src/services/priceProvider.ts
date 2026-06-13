export interface PriceResult {
  ticker: string;
  price: number;
  currency: string;
  fetchedAt: number;
}

export interface IPriceProvider {
  fetchPrice(ticker: string): Promise<PriceResult | null>;
  fetchPrices(tickers: string[]): Promise<PriceResult[]>;
}
