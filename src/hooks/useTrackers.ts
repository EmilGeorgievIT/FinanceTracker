import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as repo from '../repositories/trackerRepository';
import type {
  TrackerRow,
  SavingsGoalFull,
  IncomeTrackerFull,
  ExpenseTrackerFull,
  MortgageFull,
  LoanFull,
  VariableHoldingFull,
} from '../repositories/trackerRepository';

// Prevent rapid successive re-fetches (React Strict Mode fires effects twice in dev)
function useGuardedRefresh(fn: () => Promise<void>, deps: any[] = []) {
  const lastRefresh = useRef(0);
  const MIN_INTERVAL = 500; // ms

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

export function useTrackers() {
  const [trackers, setTrackers] = useState<TrackerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const doRefresh = useCallback(async () => {
    const data = await repo.getAllTrackers();
    setTrackers(data);
    setLoading(false);
  }, []);

  const refresh = useGuardedRefresh(doRefresh);

  return { trackers, loading, refresh };
}

export function useTrackerWithTransactions(trackerId: number) {
  const [tracker, setTracker] = useState<TrackerRow | null>(null);
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoalFull['details'] | null>(null);
  const [incomeTracker, setIncomeTracker] = useState<IncomeTrackerFull['details'] | null>(null);
  const [expenseTracker, setExpenseTracker] = useState<ExpenseTrackerFull['details'] | null>(null);
  const [mortgage, setMortgage] = useState<MortgageFull['details'] | null>(null);
  const [loan, setLoan] = useState<LoanFull['details'] | null>(null);
  const [variableHolding, setVariableHolding] = useState<VariableHoldingFull['details'] | null>(null);
  const [loading, setLoading] = useState(true);

  const doRefresh = useCallback(async () => {
    const t = await repo.getTrackerById(trackerId);
    setTracker(t ?? null);
    setSavingsGoal(null);
    setIncomeTracker(null);
    setExpenseTracker(null);
    setMortgage(null);
    setLoan(null);
    setVariableHolding(null);

    if (t) {
      if (t.type === 'savings_goal') {
        setSavingsGoal((await repo.getSavingsGoalByTrackerId(trackerId)) ?? null);
      } else if (t.type === 'income') {
        setIncomeTracker((await repo.getIncomeTrackerByTrackerId(trackerId)) ?? null);
      } else if (t.type === 'expense') {
        setExpenseTracker((await repo.getExpenseTrackerByTrackerId(trackerId)) ?? null);
      } else if (t.type === 'mortgage') {
        setMortgage((await repo.getMortgageByTrackerId(trackerId)) ?? null);
      } else if (t.type === 'loan') {
        setLoan((await repo.getLoanByTrackerId(trackerId)) ?? null);
      } else if (t.type === 'variable_holding') {
        setVariableHolding((await repo.getVariableHoldingByTrackerId(trackerId)) ?? null);
      }
    }
    setLoading(false);
  }, [trackerId]);

  const refresh = useGuardedRefresh(doRefresh, [trackerId]);

  return { tracker, savingsGoal, incomeTracker, expenseTracker, mortgage, loan, variableHolding, loading, refresh };
}

export function useCreateSavingsGoal() {
  return useCallback(async (params: {
    name: string;
    targetAmount: number;
    monthlyContribution: number;
    priority: number;
  }): Promise<SavingsGoalFull> => {
    return repo.createSavingsGoal(params);
  }, []);
}

export function useCreateIncomeTracker() {
  return useCallback(async (params: {
    name: string;
    netMonthlyAmount: number;
    paymentDay: number;
  }): Promise<IncomeTrackerFull> => {
    return repo.createIncomeTracker(params);
  }, []);
}

export function useCreateExpenseTracker() {
  return useCallback(async (params: {
    name: string;
    amount: number;
    frequency: 'monthly' | 'one_off';
    dateValue: number;
    categoryId?: number;
  }): Promise<ExpenseTrackerFull> => {
    return repo.createExpenseTracker(params);
  }, []);
}

export function useCreateMortgage() {
  return useCallback(async (params: {
    name: string;
    principal: number;
    balance: number;
    interestRate: number;
    monthlyPayment: number;
    propertyValue: number;
  }): Promise<MortgageFull> => {
    return repo.createMortgage(params);
  }, []);
}

export function useCreateLoan() {
  return useCallback(async (params: {
    name: string;
    principal: number;
    balance: number;
    interestRate: number;
    monthlyPayment: number;
  }): Promise<LoanFull> => {
    return repo.createLoan(params);
  }, []);
}

export function useCreateVariableHolding() {
  return useCallback(async (params: {
    name: string;
    ticker: string;
    units: number;
    avgPurchasePrice: number;
  }): Promise<VariableHoldingFull> => {
    return repo.createVariableHolding(params);
  }, []);
}

export function useDeleteTracker() {
  return useCallback(async (id: number): Promise<void> => {
    return repo.deleteTracker(id);
  }, []);
}
