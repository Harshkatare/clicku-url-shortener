ALTER TABLE "urls" ADD COLUMN "custom_alias" varchar(50);--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_custom_alias_unique" UNIQUE("custom_alias");