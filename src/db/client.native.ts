import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const expoDb = openDatabaseSync('finance_tracker.db');
    _db = drizzle(expoDb);
  }
  return _db;
}

// Proxy so `db.select()...`, `db.insert()...`, etc. Just Work without
// changing every call site to `getDb().select()...`.
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop: string) {
    return (getDb() as any)[prop];
  },
});
