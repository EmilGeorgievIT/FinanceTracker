import { db } from '../db/client';
import { tracker, savingsGoal, variableHolding, mortgage, loan, incomeTracker, expenseTracker, category, transaction } from '../db/schema';

export async function exportAllData(): Promise<string> {
  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    trackers: await db.select().from(tracker),
    savingsGoals: await db.select().from(savingsGoal),
    variableHoldings: await db.select().from(variableHolding),
    mortgages: await db.select().from(mortgage),
    loans: await db.select().from(loan),
    incomeTrackers: await db.select().from(incomeTracker),
    expenseTrackers: await db.select().from(expenseTracker),
    categories: await db.select().from(category),
    transactions: await db.select().from(transaction),
  };
  return JSON.stringify(data, null, 2);
}
