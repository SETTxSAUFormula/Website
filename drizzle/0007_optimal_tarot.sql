CREATE TABLE `panel_member_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`member_email` text NOT NULL,
	`action` text NOT NULL,
	`before_state` text DEFAULT '' NOT NULL,
	`after_state` text DEFAULT '' NOT NULL,
	`actor_email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_member_audit_member_created` ON `panel_member_audit` (`member_email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_member_audit_actor_created` ON `panel_member_audit` (`actor_email`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
