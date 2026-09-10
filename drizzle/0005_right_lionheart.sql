CREATE TABLE `panel_inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`department` text DEFAULT 'team' NOT NULL,
	`unit` text DEFAULT 'adet' NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`min_quantity` integer DEFAULT 0 NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`condition` text DEFAULT 'good' NOT NULL,
	`custodian_email` text DEFAULT '' NOT NULL,
	`sponsor_id` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_inventory_archived_department_category` ON `panel_inventory_items` (`archived`,`department`,`category`);--> statement-breakpoint
CREATE INDEX `idx_panel_inventory_custodian_updated` ON `panel_inventory_items` (`custodian_email`,`updated_at`);--> statement-breakpoint
CREATE TABLE `panel_inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity_delta` integer DEFAULT 0 NOT NULL,
	`previous_quantity` integer DEFAULT 0 NOT NULL,
	`new_quantity` integer DEFAULT 0 NOT NULL,
	`custodian_email` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_inventory_movements_item_created` ON `panel_inventory_movements` (`item_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `panel_purchase_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`department` text DEFAULT 'team' NOT NULL,
	`item_id` text DEFAULT '' NOT NULL,
	`sponsor_id` text DEFAULT '' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'adet' NOT NULL,
	`justification` text DEFAULT '' NOT NULL,
	`vendor` text DEFAULT '' NOT NULL,
	`estimated_cost` integer DEFAULT 0 NOT NULL,
	`actual_cost` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'TRY' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`needed_at` integer,
	`order_reference` text DEFAULT '' NOT NULL,
	`requested_by` text NOT NULL,
	`approved_by` text DEFAULT '' NOT NULL,
	`approved_at` integer,
	`ordered_at` integer,
	`delivered_at` integer,
	`stock_applied` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_panel_purchases_status_department_needed` ON `panel_purchase_requests` (`status`,`department`,`needed_at`);--> statement-breakpoint
CREATE INDEX `idx_panel_purchases_item_updated` ON `panel_purchase_requests` (`item_id`,`updated_at`);--> statement-breakpoint
PRAGMA optimize;
