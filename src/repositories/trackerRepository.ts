import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { tracker, savingsGoal, incomeTracker, expenseTracker, mortgage, loan, variableHolding } from '../db/schema';
import type { TrackerType } from '../types/enums';

export type TrackerRow = typeof tracker.$inferSelect;
export type SavingsGoalRow = typeof savingsGoal.$inferSelect;
export type NewTracker = typeof tracker.$inferInsert;

export interface SavingsGoalFull {
  tracker: TrackerRow;
  details: SavingsGoalRow;
}

export async function createTracker(params: {
  name: string;
  type: TrackerType;
}): Promise<TrackerRow> {
  const now = Date.now();
  const rows = await db
    .insert(tracker)
    .values({
      name: params.name,
      type: params.type,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0];
}

export async function createSavingsGoal(params: {
  name: string;
  targetAmount: number;
  monthlyContribution: number;
  priority: number;
}): Promise<SavingsGoalFull> {
  const t = await createTracker({ name: params.name, type: 'savings_goal' });

  const details = await db
    .insert(savingsGoal)
    .values({
      trackerId: t.id,
      targetAmount: params.targetAmount,
      currentBalance: 0,
      monthlyContribution: params.monthlyContribution,
      priority: params.priority,
    })
    .returning();

  return { tracker: t, details: details[0] };
}

export async function getAllTrackers(): Promise<TrackerRow[]> {
  return db.select().from(tracker).orderBy(desc(tracker.updatedAt));
}

export async function getTrackerById(id: number): Promise<TrackerRow | undefined> {
  const rows = await db.select().from(tracker).where(eq(tracker.id, id));
  return rows[0];
}

export async function getSavingsGoalByTrackerId(trackerId: number): Promise<SavingsGoalRow | undefined> {
  const rows = await db
    .select()
    .from(savingsGoal)
    .where(eq(savingsGoal.trackerId, trackerId));
  return rows[0];
}

export async function updateSavingsGoalBalance(trackerId: number, newBalance: number): Promise<void> {
  const now = Date.now();
  await db
    .update(savingsGoal)
    .set({ currentBalance: newBalance })
    .where(eq(savingsGoal.trackerId, trackerId));
  await db
    .update(tracker)
    .set({ updatedAt: now })
    .where(eq(tracker.id, trackerId));
}

export async function deleteTracker(id: number): Promise<void> {
  await db.delete(tracker).where(eq(tracker.id, id));
}

// ─── Income Tracker ──────────────────────────────────────────────────

export type IncomeTrackerRow = typeof incomeTracker.$inferSelect;

export interface IncomeTrackerFull {
  tracker: TrackerRow;
  details: IncomeTrackerRow;
}

export async function createIncomeTracker(params: {
  name: string;
  netMonthlyAmount: number;
  paymentDay: number;
}): Promise<IncomeTrackerFull> {
  const t = await createTracker({ name: params.name, type: 'income' });
  const details = await db
    .insert(incomeTracker)
    .values({
      trackerId: t.id,
      netMonthlyAmount: params.netMonthlyAmount,
      paymentDay: params.paymentDay,
    })
    .returning();
  return { tracker: t, details: details[0] };
}

export async function getIncomeTrackerByTrackerId(trackerId: number): Promise<IncomeTrackerRow | undefined> {
  const rows = await db.select().from(incomeTracker).where(eq(incomeTracker.trackerId, trackerId));
  return rows[0];
}

// ─── Expense Tracker ─────────────────────────────────────────────────

export type ExpenseTrackerRow = typeof expenseTracker.$inferSelect;

export interface ExpenseTrackerFull {
  tracker: TrackerRow;
  details: ExpenseTrackerRow;
}

export async function createExpenseTracker(params: {
  name: string;
  amount: number;
  frequency: 'monthly' | 'one_off';
  dateValue: number;
  categoryId?: number;
}): Promise<ExpenseTrackerFull> {
  const t = await createTracker({ name: params.name, type: 'expense' });
  const details = await db
    .insert(expenseTracker)
    .values({
      trackerId: t.id,
      amount: params.amount,
      frequency: params.frequency,
      dateValue: params.dateValue,
      categoryId: params.categoryId ?? null,
    })
    .returning();
  return { tracker: t, details: details[0] };
}

export async function getExpenseTrackerByTrackerId(trackerId: number): Promise<ExpenseTrackerRow | undefined> {
  const rows = await db.select().from(expenseTracker).where(eq(expenseTracker.trackerId, trackerId));
  return rows[0];
}

// ─── Mortgage ────────────────────────────────────────────────────────

export type MortgageRow = typeof mortgage.$inferSelect;

export interface MortgageFull {
  tracker: TrackerRow;
  details: MortgageRow;
}

export async function createMortgage(params: {
  name: string;
  principal: number;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
  propertyValue: number;
}): Promise<MortgageFull> {
  const t = await createTracker({ name: params.name, type: 'mortgage' });
  const details = await db
    .insert(mortgage)
    .values({
      trackerId: t.id,
      principal: params.principal,
      balance: params.balance,
      interestRate: params.interestRate,
      monthlyPayment: params.monthlyPayment,
      propertyValue: params.propertyValue,
    })
    .returning();
  return { tracker: t, details: details[0] };
}

export async function getMortgageByTrackerId(trackerId: number): Promise<MortgageRow | undefined> {
  const rows = await db.select().from(mortgage).where(eq(mortgage.trackerId, trackerId));
  return rows[0];
}

export async function updateMortgageBalance(trackerId: number, newBalance: number): Promise<void> {
  const now = Date.now();
  await db.update(mortgage).set({ balance: newBalance }).where(eq(mortgage.trackerId, trackerId));
  await db.update(tracker).set({ updatedAt: now }).where(eq(tracker.id, trackerId));
}

// ─── Loan ────────────────────────────────────────────────────────────

export type LoanRow = typeof loan.$inferSelect;

export interface LoanFull {
  tracker: TrackerRow;
  details: LoanRow;
}

export async function createLoan(params: {
  name: string;
  principal: number;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
}): Promise<LoanFull> {
  const t = await createTracker({ name: params.name, type: 'loan' });
  const details = await db
    .insert(loan)
    .values({
      trackerId: t.id,
      principal: params.principal,
      balance: params.balance,
      interestRate: params.interestRate,
      monthlyPayment: params.monthlyPayment,
    })
    .returning();
  return { tracker: t, details: details[0] };
}

export async function getLoanByTrackerId(trackerId: number): Promise<LoanRow | undefined> {
  const rows = await db.select().from(loan).where(eq(loan.trackerId, trackerId));
  return rows[0];
}

export async function updateLoanBalance(trackerId: number, newBalance: number): Promise<void> {
  const now = Date.now();
  await db.update(loan).set({ balance: newBalance }).where(eq(loan.trackerId, trackerId));
  await db.update(tracker).set({ updatedAt: now }).where(eq(tracker.id, trackerId));
}

// ─── Variable Holding ────────────────────────────────────────────────

export type VariableHoldingRow = typeof variableHolding.$inferSelect;

export interface VariableHoldingFull {
  tracker: TrackerRow;
  details: VariableHoldingRow;
}

export async function createVariableHolding(params: {
  name: string;
  ticker: string;
  units: number;
  avgPurchasePrice: number;
}): Promise<VariableHoldingFull> {
  const t = await createTracker({ name: params.name, type: 'variable_holding' });
  const details = await db
    .insert(variableHolding)
    .values({
      trackerId: t.id,
      ticker: params.ticker,
      units: params.units,
      avgPurchasePrice: params.avgPurchasePrice,
    })
    .returning();
  return { tracker: t, details: details[0] };
}

export async function getVariableHoldingByTrackerId(trackerId: number): Promise<VariableHoldingRow | undefined> {
  const rows = await db.select().from(variableHolding).where(eq(variableHolding.trackerId, trackerId));
  return rows[0];
}

export async function updateVariableHoldingPrice(
  trackerId: number,
  currentPrice: number,
): Promise<void> {
  const now = Date.now();
  await db
    .update(variableHolding)
    .set({ currentPrice, lastFetchedAt: now })
    .where(eq(variableHolding.trackerId, trackerId));
  await db.update(tracker).set({ updatedAt: now }).where(eq(tracker.id, trackerId));
}

export async function updateVariableHoldingAfterBuy(
  trackerId: number,
  newUnits: number,
  newAvgPrice: number,
): Promise<void> {
  const now = Date.now();
  await db
    .update(variableHolding)
    .set({ units: newUnits, avgPurchasePrice: newAvgPrice })
    .where(eq(variableHolding.trackerId, trackerId));
  await db.update(tracker).set({ updatedAt: now }).where(eq(tracker.id, trackerId));
}

export async function getAllVariableHoldings(): Promise<VariableHoldingRow[]> {
  return db.select().from(variableHolding);
}
