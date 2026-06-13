export type TrackerType =
  | 'savings_goal'
  | 'variable_holding'
  | 'mortgage'
  | 'loan'
  | 'income'
  | 'expense';

export type TransactionType =
  | 'deposit'
  | 'buy'
  | 'sell'
  | 'payment'
  | 'balance_adjustment';

export type ExpenseFrequency = 'monthly' | 'one_off';

export const DEFAULT_CATEGORIES = [
  'Housing',
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Other',
] as const;
