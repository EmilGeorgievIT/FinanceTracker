import { useCallback, useState } from 'react';
import * as repo from '../repositories/trackerRepository';
import { priceService } from '../services/priceService';

export function usePriceRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setLastError(null);

    try {
      const holdings = await repo.getAllVariableHoldings();
      const tickers = holdings.map((h) => h.ticker).filter(Boolean);
      if (tickers.length === 0) return;

      const results = await priceService.fetchPrices(tickers);
      for (const result of results) {
        const holding = holdings.find((h) => h.ticker === result.ticker);
        if (holding) {
          await repo.updateVariableHoldingPrice(holding.trackerId, result.price);
        }
      }

      // Report failures
      const failed = tickers.filter((t) => !results.find((r) => r.ticker === t));
      if (failed.length > 0) {
        setLastError(`Could not fetch: ${failed.join(', ')}`);
      }
    } catch (e: any) {
      setLastError(e?.message ?? 'Failed to refresh prices');
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { refreshing, lastError, refreshAll };
}
