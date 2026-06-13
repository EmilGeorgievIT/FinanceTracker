import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { transaction } from '../db/schema';
import type { TransactionType } from '../types/enums';

export type TransactionRow = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

export async function createTransaction(params: {
  trackerId: number;
  type: TransactionType;
  amount: number;
  units?: number;
  pricePerUnit?: number;
  note?: string;
}): Promise<TransactionRow> {
  const rows = await db
    .insert(transaction)
    .values({
      trackerId: params.trackerId,
      type: params.type,
      amount: params.amount,
      units: params.units ?? null,
      pricePerUnit: params.pricePerUnit ?? null,
      note: params.note ?? null,
      createdAt: Date.now(),
    })
    .returning();
  return rows[0];
}

export async function getTransactionsByTrackerId(trackerId: number): Promise<TransactionRow[]> {
  return db
    .select()
    .from(transaction)
    .where(eq(transaction.trackerId, trackerId))
    .orderBy(desc(transaction.createdAt));
}

export async function getAllTransactions(): Promise<TransactionRow[]> {
  return db.select().from(transaction).orderBy(desc(transaction.createdAt));
}
