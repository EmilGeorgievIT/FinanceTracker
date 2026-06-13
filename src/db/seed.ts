import { Platform } from 'react-native';
import { db } from './client';
import { category } from './schema';
import { DEFAULT_CATEGORIES } from '../types/enums';
import { runMigrations } from './migrate';

export async function initializeDatabase(): Promise<void> {
  // On native, runMigrations uses expo-sqlite via migrate.native.ts.
  // On web, it's a no-op — expo-sqlite needs COOP/COEP headers in dev.
  if (Platform.OS !== 'web') {
    runMigrations();
  }

  try {
    const existing = await db.select().from(category);
    if (existing.length > 0) return;
  } catch {
    // ignore — web mock may behave differently
  }

  for (const name of DEFAULT_CATEGORIES) {
    try {
      await db.insert(category).values({ name, isDefault: 1 });
    } catch {
      // ignore duplicates
    }
  }
}
