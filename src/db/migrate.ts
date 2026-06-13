// Web fallback — expo-sqlite needs SharedArrayBuffer (COOP/COEP headers)
// which Metro doesn't serve in dev mode. The real migrations run via migrate.native.ts.
export function runMigrations(): void {
  // no-op on web
}
