CREATE TABLE "click_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_id" uuid NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" varchar(64),
	"country" varchar(2),
	"city" varchar(100),
	"is_bot" boolean DEFAULT false NOT NULL,
	"device_type" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"referrer" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "daily_url_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_id" uuid NOT NULL,
	"date" date NOT NULL,
	"total_clicks" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_url_stats" ADD CONSTRAINT "daily_url_stats_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "click_events_url_clicked_idx" ON "click_events" USING btree ("url_id","clicked_at");--> statement-breakpoint
CREATE INDEX "click_events_clicked_at_idx" ON "click_events" USING btree ("clicked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_url_stats_url_date_idx" ON "daily_url_stats" USING btree ("url_id","date");