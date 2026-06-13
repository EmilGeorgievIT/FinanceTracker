import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as repo from '../repositories/transactionRepository';
import * as trackerRepo from '../repositories/trackerRepository';
import type { TransactionRow } from '../repositories/transactionRepository';
import type { TransactionType } from '../types/enums';

function useGuardedRefresh(fn: () => Promise<void>, deps: any[] = []) {
  const lastRefresh = useRef(0);
  const MIN_INTERVAL = 500;

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefresh.current < MIN_INTERVAL) return;
    lastRefresh.current = now;
    await fn();
  }, deps);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return refresh;
}

export function useTransactions(trackerId: number) {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const doRefresh = useCallback(async () => {
    const data = await repo.getTransactionsByTrackerId(trackerId);
    setTransactions(data);
    setLoading(false);
  }, [trackerId]);

  const refresh = useGuardedRefresh(doRefresh, [trackerId]);

  return { transactions, loading, refresh };
}

export function useAddTransaction() {
  return useCallback(
    async (params: {
      trackerId: number;
      type: TransactionType;
      amount: number;
      units?: number;
      pricePerUnit?: number;
      note?: string;
    }): Promise<TransactionRow> => {
      const tx = await repo.createTransaction(params);

      if (params.type === 'deposit') {
        const sg = await trackerRepo.getSavingsGoalByTrackerId(params.trackerId);
        if (sg) {
          await trackerRepo.updateSavingsGoalBalance(params.trackerId, sg.currentBalance + params.amount);
        }
      } else if (params.type === 'payment') {
        const m = await trackerRepo.getMortgageByTrackerId(params.trackerId);
        if (m) {
          await trackerRepo.updateMortgageBalance(params.trackerId, m.balance - params.amount);
        } else {
          const l = await trackerRepo.getLoanByTrackerId(params.trackerId);
          if (l) {
            await trackerRepo.updateLoanBalance(params.trackerId, l.balance - params.amount);
          }
        }
      } else if (params.type === 'buy' && params.units && params.pricePerUnit) {
        const vh = await trackerRepo.getVariableHoldingByTrackerId(params.trackerId);
        if (vh) {
          const totalCost = vh.units * vh.avgPurchasePrice + params.units * params.pricePerUnit;
          const newUnits = vh.units + params.units;
          const newAvg = totalCost / newUnits;
          await trackerRepo.updateVariableHoldingAfterBuy(params.trackerId, newUnits, newAvg);
        }
      }

      return tx;
    },
    []
  );
}
