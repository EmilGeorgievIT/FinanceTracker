import { rawDb } from './client';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS category (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  is_default integer DEFAULT 0 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS category_name_unique ON category (name);

CREATE TABLE IF NOT EXISTS tracker (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  type text NOT NULL,
  name text NOT NULL,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);

CREATE TABLE IF NOT EXISTS savings_goal (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL UNIQUE,
  target_amount real NOT NULL,
  current_balance real DEFAULT 0 NOT NULL,
  monthly_contribution real DEFAULT 0 NOT NULL,
  priority integer DEFAULT 0 NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS variable_holding (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL UNIQUE,
  ticker text NOT NULL,
  units real DEFAULT 0 NOT NULL,
  avg_purchase_price real DEFAULT 0 NOT NULL,
  current_price real,
  last_fetched_at integer,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mortgage (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL UNIQUE,
  principal real NOT NULL,
  balance real NOT NULL,
  interest_rate real NOT NULL,
  monthly_payment real NOT NULL,
  property_value real NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loan (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL UNIQUE,
  principal real NOT NULL,
  balance real NOT NULL,
  interest_rate real NOT NULL,
  monthly_payment real NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS income_tracker (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL UNIQUE,
  net_monthly_amount real NOT NULL,
  payment_day integer NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expense_tracker (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL UNIQUE,
  amount real NOT NULL,
  frequency text NOT NULL,
  date_value integer NOT NULL,
  category_id integer,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tracker_id integer NOT NULL,
  type text NOT NULL,
  amount real NOT NULL,
  units real,
  price_per_unit real,
  note text,
  created_at integer NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES tracker(id) ON DELETE CASCADE
);
`;

export function runMigrations(): void {
  rawDb.execSync(MIGRATION_SQL);
}
