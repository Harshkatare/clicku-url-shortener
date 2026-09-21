ALTER TABLE "urls" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "urls_user_pinned_idx" ON "urls" USING btree ("user_id","is_pinned");