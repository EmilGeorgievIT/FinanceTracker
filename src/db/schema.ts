import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Tracker (base table, type discriminator) ────────────────────────

export const trackerTypeEnum = [
  'savings_goal',
  'variable_holding',
  'mortgage',
  'loan',
  'income',
  'expense',
] as const;
export type TrackerType = (typeof trackerTypeEnum)[number];

export const tracker = sqliteTable('tracker', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull().$type<TrackerType>(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const trackerRelations = relations(tracker, ({ one, many }) => ({
  savingsGoal: one(savingsGoal, {
    fields: [tracker.id],
    references: [savingsGoal.trackerId],
  }),
  variableHolding: one(variableHolding, {
    fields: [tracker.id],
    references: [variableHolding.trackerId],
  }),
  mortgage: one(mortgage, {
    fields: [tracker.id],
    references: [mortgage.trackerId],
  }),
  loan: one(loan, {
    fields: [tracker.id],
    references: [loan.trackerId],
  }),
  incomeTracker: one(incomeTracker, {
    fields: [tracker.id],
    references: [incomeTracker.trackerId],
  }),
  expenseTracker: one(expenseTracker, {
    fields: [tracker.id],
    references: [expenseTracker.trackerId],
  }),
  transactions: many(transaction),
}));

// ─── Subtype tables ───────────────────────────────────────────────────

export const savingsGoal = sqliteTable('savings_goal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().unique().references(() => tracker.id, { onDelete: 'cascade' }),
  targetAmount: real('target_amount').notNull(),
  currentBalance: real('current_balance').notNull().default(0),
  monthlyContribution: real('monthly_contribution').notNull().default(0),
  priority: integer('priority').notNull().default(0),
});

export const variableHolding = sqliteTable('variable_holding', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().unique().references(() => tracker.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  units: real('units').notNull().default(0),
  avgPurchasePrice: real('avg_purchase_price').notNull().default(0),
  currentPrice: real('current_price'),
  lastFetchedAt: integer('last_fetched_at'),
});

export const mortgage = sqliteTable('mortgage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().unique().references(() => tracker.id, { onDelete: 'cascade' }),
  principal: real('principal').notNull(),
  balance: real('balance').notNull(),
  interestRate: real('interest_rate').notNull(),
  monthlyPayment: real('monthly_payment').notNull(),
  propertyValue: real('property_value').notNull(),
});

export const loan = sqliteTable('loan', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().unique().references(() => tracker.id, { onDelete: 'cascade' }),
  principal: real('principal').notNull(),
  balance: real('balance').notNull(),
  interestRate: real('interest_rate').notNull(),
  monthlyPayment: real('monthly_payment').notNull(),
});

export const incomeTracker = sqliteTable('income_tracker', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().unique().references(() => tracker.id, { onDelete: 'cascade' }),
  netMonthlyAmount: real('net_monthly_amount').notNull(),
  paymentDay: integer('payment_day').notNull(),
});

export const expenseTracker = sqliteTable('expense_tracker', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().unique().references(() => tracker.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  frequency: text('frequency').notNull().$type<'monthly' | 'one_off'>(),
  dateValue: integer('date_value').notNull(),
  categoryId: integer('category_id').references(() => category.id),
});

// ─── Category ─────────────────────────────────────────────────────────

export const category = sqliteTable('category', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isDefault: integer('is_default').notNull().default(0),
});

// ─── Transaction ──────────────────────────────────────────────────────

export const transactionTypeEnum = [
  'deposit',
  'buy',
  'sell',
  'payment',
  'balance_adjustment',
] as const;
export type TransactionType = (typeof transactionTypeEnum)[number];

export const transaction = sqliteTable('transaction', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackerId: integer('tracker_id').notNull().references(() => tracker.id, { onDelete: 'cascade' }),
  type: text('type').notNull().$type<TransactionType>(),
  amount: real('amount').notNull(),
  units: real('units'),
  pricePerUnit: real('price_per_unit'),
  note: text('note'),
  createdAt: integer('created_at').notNull(),
});

export const transactionRelations = relations(transaction, ({ one }) => ({
  tracker: one(tracker, {
    fields: [transaction.trackerId],
    references: [tracker.id],
  }),
}));
