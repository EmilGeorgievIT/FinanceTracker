import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { category } from '../db/schema';

export type CategoryRow = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export async function getAllCategories(): Promise<CategoryRow[]> {
  return db.select().from(category).orderBy(category.name);
}

export async function getCategoryById(id: number): Promise<CategoryRow | undefined> {
  const rows = await db.select().from(category).where(eq(category.id, id));
  return rows[0];
}

export async function createCategory(name: string): Promise<CategoryRow> {
  const rows = await db.insert(category).values({ name, isDefault: 0 }).returning();
  return rows[0];
}

export async function updateCategory(id: number, name: string): Promise<void> {
  await db.update(category).set({ name }).where(eq(category.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  await db.delete(category).where(eq(category.id, id));
}
