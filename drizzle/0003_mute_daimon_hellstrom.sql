CREATE TABLE `panel_sponsor_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`sponsor_id` text NOT NULL,
	`kind` text DEFAULT 'note' NOT NULL,
	`summary` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_sponsor_activities_sponsor_occurred` ON `panel_sponsor_activities` (`sponsor_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `panel_sponsor_obligations` (
	`id` text PRIMARY KEY NOT NULL,
	`sponsor_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`due_at` integer,
	`owner_email` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_sponsor_obligations_sponsor_status_due` ON `panel_sponsor_obligations` (`sponsor_id`,`status`,`due_at`);--> statement-breakpoint
CREATE TABLE `panel_sponsors` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`sector` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`stage` text DEFAULT 'prospect' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`package_name` text DEFAULT '' NOT NULL,
	`estimated_value` integer DEFAULT 0 NOT NULL,
	`confirmed_value` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'TRY' NOT NULL,
	`contact_name` text DEFAULT '' NOT NULL,
	`contact_email` text DEFAULT '' NOT NULL,
	`contact_phone` text DEFAULT '' NOT NULL,
	`owner_email` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`next_action` text DEFAULT '' NOT NULL,
	`next_action_at` integer,
	`notes` text DEFAULT '' NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_sponsors_archived_stage_next_action` ON `panel_sponsors` (`archived`,`stage`,`next_action_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_sponsors_owner_updated` ON `panel_sponsors` (`owner_email`,`updated_at`);--> statement-breakpoint
PRAGMA optimize;
