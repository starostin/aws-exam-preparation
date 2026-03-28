ALTER TYPE "task_type" ADD VALUE IF NOT EXISTS 'course';--> statement-breakpoint
ALTER TYPE "task_type" ADD VALUE IF NOT EXISTS 'video';--> statement-breakpoint

ALTER TABLE "study_tasks" ADD COLUMN "external_resource_id" uuid;--> statement-breakpoint
ALTER TABLE "study_tasks" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "study_tasks" ADD COLUMN "planned_minutes" integer;--> statement-breakpoint

ALTER TABLE "study_tasks"
ADD CONSTRAINT "study_tasks_external_resource_id_external_resources_id_fk"
FOREIGN KEY ("external_resource_id")
REFERENCES "public"."external_resources"("id")
ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "study_tasks_study_plan_id_scheduled_date_idx"
ON "study_tasks" ("study_plan_id", "scheduled_date");