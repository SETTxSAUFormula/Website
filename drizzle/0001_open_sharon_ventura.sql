CREATE TABLE `panel_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`department` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_activity_department_created_at` ON `panel_activity` (`department`,`created_at`);--> statement-breakpoint
CREATE TABLE `panel_announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`department` text,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`level` text DEFAULT 'normal' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`email_status` text DEFAULT 'not_requested' NOT NULL,
	`recipient_count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_announcements_department_created_at` ON `panel_announcements` (`department`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_announcements_pinned_created_at` ON `panel_announcements` (`pinned`,`created_at`);--> statement-breakpoint
CREATE TABLE `panel_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`department` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_decisions_department_created_at` ON `panel_decisions` (`department`,`created_at`);--> statement-breakpoint
CREATE TABLE `panel_department_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`from_department` text NOT NULL,
	`to_department` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`due_at` integer,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_department_requests_target_status` ON `panel_department_requests` (`to_department`,`status`);--> statement-breakpoint
CREATE INDEX `idx_panel_department_requests_source_status` ON `panel_department_requests` (`from_department`,`status`);--> statement-breakpoint
CREATE TABLE `panel_department_settings` (
	`department` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`season_goal` text DEFAULT '' NOT NULL,
	`weekly_note` text DEFAULT '' NOT NULL,
	`chief_email` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_panel_department_settings_display_name` ON `panel_department_settings` (`display_name`);--> statement-breakpoint
CREATE TABLE `panel_members` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`department` text,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_members_department_active` ON `panel_members` (`department`,`active`);--> statement-breakpoint
CREATE TABLE `panel_task_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`department` text,
	`name` text NOT NULL,
	`tasks` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_task_templates_department` ON `panel_task_templates` (`department`);--> statement-breakpoint
CREATE TABLE `panel_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`department` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`assignee_emails` text DEFAULT '[]' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`due_at` integer,
	`progress` integer DEFAULT 0 NOT NULL,
	`requires_approval` integer DEFAULT false NOT NULL,
	`approved_at` integer,
	`approved_by` text DEFAULT '' NOT NULL,
	`checklist` text DEFAULT '[]' NOT NULL,
	`blocker_note` text DEFAULT '' NOT NULL,
	`dependency_note` text DEFAULT '' NOT NULL,
	`calendar_url` text DEFAULT '' NOT NULL,
	`purchase_reference` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_panel_tasks_department_status_due_at` ON `panel_tasks` (`department`,`status`,`due_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_tasks_updated_at` ON `panel_tasks` (`updated_at`);