import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as trackerRepo from '../repositories/trackerRepository';

export interface DashboardSummary {
  totalSavingsBalance: number;
  totalSavingsTarget: number;
  totalDebtBalance: number;
  totalDebtPrincipal: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  holdingsValue: number;
  holdingsCost: number;
}

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalSavingsBalance: 0,
    totalSavingsTarget: 0,
    totalDebtBalance: 0,
    totalDebtPrincipal: 0,
    totalMonthlyIncome: 0,
    totalMonthlyExpenses: 0,
    holdingsValue: 0,
    holdingsCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const lastRefresh = useRef(0);

  const doRefresh = useCallback(async () => {
    const trackers = await trackerRepo.getAllTrackers();
    const s: DashboardSummary = {
      totalSavingsBalance: 0, totalSavingsTarget: 0,
      totalDebtBalance: 0, totalDebtPrincipal: 0,
      totalMonthlyIncome: 0, totalMonthlyExpenses: 0,
      holdingsValue: 0, holdingsCost: 0,
    };

    for (const t of trackers) {
      if (t.type === 'savings_goal') {
        const sg = await trackerRepo.getSavingsGoalByTrackerId(t.id);
        if (sg) { s.totalSavingsBalance += sg.currentBalance; s.totalSavingsTarget += sg.targetAmount; }
      } else if (t.type === 'income') {
        const inc = await trackerRepo.getIncomeTrackerByTrackerId(t.id);
        if (inc) s.totalMonthlyIncome += inc.netMonthlyAmount;
      } else if (t.type === 'expense') {
        const exp = await trackerRepo.getExpenseTrackerByTrackerId(t.id);
        if (exp && exp.frequency === 'monthly') s.totalMonthlyExpenses += exp.amount;
      } else if (t.type === 'mortgage') {
        const m = await trackerRepo.getMortgageByTrackerId(t.id);
        if (m) { s.totalDebtBalance += m.balance; s.totalDebtPrincipal += m.principal; }
      } else if (t.type === 'loan') {
        const l = await trackerRepo.getLoanByTrackerId(t.id);
        if (l) { s.totalDebtBalance += l.balance; s.totalDebtPrincipal += l.principal; }
      } else if (t.type === 'variable_holding') {
        const vh = await trackerRepo.getVariableHoldingByTrackerId(t.id);
        if (vh) {
          const price = vh.currentPrice ?? vh.avgPurchasePrice;
          s.holdingsValue += vh.units * price;
          s.holdingsCost += vh.units * vh.avgPurchasePrice;
        }
      }
    }
    setSummary(s);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefresh.current < 500) return;
    lastRefresh.current = now;
    setLoading(true);
    await doRefresh();
  }, [doRefresh]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return { summary, loading, refresh };
}
