import { db } from '../db/client';
import { tracker, savingsGoal, variableHolding, mortgage, loan, incomeTracker, expenseTracker, category, transaction } from '../db/schema';

interface ExportPayload {
  exportedAt: string;
  version: number;
  trackers: (typeof tracker.$inferSelect)[];
  savingsGoals: (typeof savingsGoal.$inferSelect)[];
  variableHoldings: (typeof variableHolding.$inferSelect)[];
  mortgages: (typeof mortgage.$inferSelect)[];
  loans: (typeof loan.$inferSelect)[];
  incomeTrackers: (typeof incomeTracker.$inferSelect)[];
  expenseTrackers: (typeof expenseTracker.$inferSelect)[];
  categories: (typeof category.$inferSelect)[];
  transactions: (typeof transaction.$inferSelect)[];
}

export function validateImportData(data: unknown): data is ExportPayload {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as any;
  return (
    typeof d.version === 'number' &&
    Array.isArray(d.trackers) &&
    Array.isArray(d.categories) &&
    Array.isArray(d.transactions)
  );
}

export async function importAllData(data: ExportPayload): Promise<{ trackers: number; categories: number; transactions: number }> {
  let catCount = 0;
  let trackerCount = 0;
  let txCount = 0;

  for (const c of data.categories) {
    try {
      await db.insert(category).values({ name: c.name, isDefault: c.isDefault ?? 0 });
      catCount++;
    } catch {
      // duplicate name, skip
    }
  }

  for (const t of data.trackers) {
    await db.insert(tracker).values({
      name: t.name,
      type: t.type,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    });
    trackerCount++;
  }

  for (const sg of data.savingsGoals) {
    try {
      await db.insert(savingsGoal).values({
        trackerId: sg.trackerId,
        targetAmount: sg.targetAmount,
        currentBalance: sg.currentBalance,
        monthlyContribution: sg.monthlyContribution,
        priority: sg.priority,
      });
    } catch { /* skip if FK fails */ }
  }

  for (const vh of data.variableHoldings) {
    try {
      await db.insert(variableHolding).values({
        trackerId: vh.trackerId,
        ticker: vh.ticker,
        units: vh.units,
        avgPurchasePrice: vh.avgPurchasePrice,
        currentPrice: vh.currentPrice,
        lastFetchedAt: vh.lastFetchedAt,
      });
    } catch { /* skip */ }
  }

  for (const m of data.mortgages) {
    try {
      await db.insert(mortgage).values({
        trackerId: m.trackerId,
        principal: m.principal,
        balance: m.balance,
        interestRate: m.interestRate,
        monthlyPayment: m.monthlyPayment,
        propertyValue: m.propertyValue,
      });
    } catch { /* skip */ }
  }

  for (const l of data.loans) {
    try {
      await db.insert(loan).values({
        trackerId: l.trackerId,
        principal: l.principal,
        balance: l.balance,
        interestRate: l.interestRate,
        monthlyPayment: l.monthlyPayment,
      });
    } catch { /* skip */ }
  }

  for (const inc of data.incomeTrackers) {
    try {
      await db.insert(incomeTracker).values({
        trackerId: inc.trackerId,
        netMonthlyAmount: inc.netMonthlyAmount,
        paymentDay: inc.paymentDay,
      });
    } catch { /* skip */ }
  }

  for (const exp of data.expenseTrackers) {
    try {
      await db.insert(expenseTracker).values({
        trackerId: exp.trackerId,
        amount: exp.amount,
        frequency: exp.frequency,
        dateValue: exp.dateValue,
        categoryId: exp.categoryId,
      });
    } catch { /* skip */ }
  }

  for (const tx of data.transactions) {
    try {
      await db.insert(transaction).values({
        trackerId: tx.trackerId,
        type: tx.type,
        amount: tx.amount,
        units: tx.units,
        pricePerUnit: tx.pricePerUnit,
        note: tx.note,
        createdAt: tx.createdAt,
      });
      txCount++;
    } catch { /* skip */ }
  }

  return { trackers: trackerCount, categories: catCount, transactions: txCount };
}
