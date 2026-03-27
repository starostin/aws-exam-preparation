ALTER TABLE "external_resources" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "external_resources" ADD COLUMN "level" varchar(30);--> statement-breakpoint
ALTER TABLE "external_resources" ADD COLUMN "tags" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "external_resources" ADD COLUMN "estimated_minutes" integer;