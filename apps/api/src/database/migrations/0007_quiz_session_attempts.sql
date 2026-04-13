CREATE TYPE "quiz_mode" AS ENUM('topic', 'mixed');--> statement-breakpoint

CREATE TYPE "quiz_question_selection" AS ENUM('all', 'unanswered');--> statement-breakpoint

CREATE TYPE "quiz_session_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint

CREATE TABLE "quiz_session_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "certification_id" uuid NOT NULL,
  "topic_id" uuid,
  "mode" "quiz_mode" NOT NULL,
  "question_selection" "quiz_question_selection" DEFAULT 'all' NOT NULL,
  "difficulty" "question_difficulty",
  "status" "quiz_session_status" DEFAULT 'in_progress' NOT NULL,
  "total_questions" integer NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "quiz_session_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "attempt_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "question_order" integer NOT NULL,
  "selected_option_id" varchar(100),
  "is_correct" boolean,
  "answered_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "quiz_session_attempts"
ADD CONSTRAINT "quiz_session_attempts_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "quiz_session_attempts"
ADD CONSTRAINT "quiz_session_attempts_certification_id_certifications_id_fk"
FOREIGN KEY ("certification_id")
REFERENCES "public"."certifications"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "quiz_session_attempts"
ADD CONSTRAINT "quiz_session_attempts_topic_id_topics_id_fk"
FOREIGN KEY ("topic_id")
REFERENCES "public"."topics"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "quiz_session_questions"
ADD CONSTRAINT "quiz_session_questions_attempt_id_quiz_session_attempts_id_fk"
FOREIGN KEY ("attempt_id")
REFERENCES "public"."quiz_session_attempts"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "quiz_session_questions"
ADD CONSTRAINT "quiz_session_questions_question_id_quiz_questions_id_fk"
FOREIGN KEY ("question_id")
REFERENCES "public"."quiz_questions"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "quiz_session_attempts_user_status_started_idx"
ON "quiz_session_attempts" ("user_id", "status", "started_at");--> statement-breakpoint

CREATE INDEX "quiz_session_attempts_certification_started_idx"
ON "quiz_session_attempts" ("certification_id", "started_at");--> statement-breakpoint

CREATE UNIQUE INDEX "quiz_session_questions_attempt_order_uidx"
ON "quiz_session_questions" ("attempt_id", "question_order");--> statement-breakpoint

CREATE UNIQUE INDEX "quiz_session_questions_attempt_question_uidx"
ON "quiz_session_questions" ("attempt_id", "question_id");--> statement-breakpoint

CREATE INDEX "quiz_session_questions_attempt_answered_idx"
ON "quiz_session_questions" ("attempt_id", "answered_at");