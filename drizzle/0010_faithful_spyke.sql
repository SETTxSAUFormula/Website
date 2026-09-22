CREATE TABLE `panel_attendance_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`late_after_minutes` integer DEFAULT 10 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`qr_secret` text DEFAULT '' NOT NULL,
	`checkin_opened_at` integer,
	`checkin_closed_at` integer,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_attendance_events_status_starts` ON `panel_attendance_events` (`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_attendance_events_starts` ON `panel_attendance_events` (`starts_at`);--> statement-breakpoint
CREATE TABLE `panel_attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`member_email` text NOT NULL,
	`status` text DEFAULT 'present' NOT NULL,
	`checked_in_at` integer NOT NULL,
	`qr_slot` integer NOT NULL,
	`user_agent` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_panel_attendance_records_event_member` ON `panel_attendance_records` (`event_id`,`member_email`);--> statement-breakpoint
CREATE INDEX `idx_panel_attendance_records_member_checked` ON `panel_attendance_records` (`member_email`,`checked_in_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_attendance_records_event_checked` ON `panel_attendance_records` (`event_id`,`checked_in_at`);