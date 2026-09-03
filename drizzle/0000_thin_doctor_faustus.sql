CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`submitted_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`assigned_department` text,
	`reviewer_note` text DEFAULT '' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`email_delivery_status` text DEFAULT 'pending' NOT NULL,
	`resend_email_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`university` text NOT NULL,
	`academic_department` text NOT NULL,
	`class_level` text NOT NULL,
	`linkedin` text DEFAULT '' NOT NULL,
	`portfolio` text DEFAULT '' NOT NULL,
	`primary_team` text NOT NULL,
	`secondary_team` text DEFAULT '' NOT NULL,
	`programs` text NOT NULL,
	`weekly_hours` text NOT NULL,
	`summer_participation` text NOT NULL,
	`busy_periods` text NOT NULL,
	`community_experience` text NOT NULL,
	`community_details` text DEFAULT '' NOT NULL,
	`projects` text NOT NULL,
	`motivation` text NOT NULL,
	`responsibility_scenario` text NOT NULL,
	`motivation_factor` text NOT NULL,
	`additional_notes` text DEFAULT '' NOT NULL,
	`language` text DEFAULT 'tr' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_applications_status_submitted_at` ON `applications` (`status`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_primary_team_submitted_at` ON `applications` (`primary_team`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_email` ON `applications` (`email`);