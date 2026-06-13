CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_unique` ON `category` (`name`);--> statement-breakpoint
CREATE TABLE `expense_tracker` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`amount` real NOT NULL,
	`frequency` text NOT NULL,
	`date_value` integer NOT NULL,
	`category_id` integer,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expense_tracker_tracker_id_unique` ON `expense_tracker` (`tracker_id`);--> statement-breakpoint
CREATE TABLE `income_tracker` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`net_monthly_amount` real NOT NULL,
	`payment_day` integer NOT NULL,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `income_tracker_tracker_id_unique` ON `income_tracker` (`tracker_id`);--> statement-breakpoint
CREATE TABLE `loan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`principal` real NOT NULL,
	`balance` real NOT NULL,
	`interest_rate` real NOT NULL,
	`monthly_payment` real NOT NULL,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loan_tracker_id_unique` ON `loan` (`tracker_id`);--> statement-breakpoint
CREATE TABLE `mortgage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`principal` real NOT NULL,
	`balance` real NOT NULL,
	`interest_rate` real NOT NULL,
	`monthly_payment` real NOT NULL,
	`property_value` real NOT NULL,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mortgage_tracker_id_unique` ON `mortgage` (`tracker_id`);--> statement-breakpoint
CREATE TABLE `savings_goal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`target_amount` real NOT NULL,
	`current_balance` real DEFAULT 0 NOT NULL,
	`monthly_contribution` real DEFAULT 0 NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `savings_goal_tracker_id_unique` ON `savings_goal` (`tracker_id`);--> statement-breakpoint
CREATE TABLE `tracker` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`units` real,
	`price_per_unit` real,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `variable_holding` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracker_id` integer NOT NULL,
	`ticker` text NOT NULL,
	`units` real DEFAULT 0 NOT NULL,
	`avg_purchase_price` real DEFAULT 0 NOT NULL,
	`current_price` real,
	`last_fetched_at` integer,
	FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variable_holding_tracker_id_unique` ON `variable_holding` (`tracker_id`);