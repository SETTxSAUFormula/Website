CREATE TABLE `panel_auth_events` (
	`id` text PRIMARY KEY NOT NULL,
	`member_email` text DEFAULT '' NOT NULL,
	`google_subject` text DEFAULT '' NOT NULL,
	`action` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_auth_events_member_created` ON `panel_auth_events` (`member_email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_auth_events_created` ON `panel_auth_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `panel_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`member_email` text NOT NULL,
	`google_subject` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`revoked_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_panel_sessions_member_expires` ON `panel_sessions` (`member_email`,`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_sessions_expires` ON `panel_sessions` (`expires_at`);