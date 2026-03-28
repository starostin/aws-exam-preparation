ALTER TABLE "external_resources" ADD COLUMN "priority" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
UPDATE "external_resources"
SET "priority" = CASE
  WHEN "type" = 'course' THEN 90
  WHEN "type" = 'practice_test' THEN 85
  WHEN "type" = 'video' THEN 75
  WHEN "type" = 'docs' THEN 65
  ELSE 50
END;