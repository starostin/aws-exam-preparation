CREATE TABLE "question_states" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "latest_selected_option_id" varchar(100),
  "latest_is_correct" boolean,
  "attempts_count" integer DEFAULT 0 NOT NULL,
  "first_answered_at" timestamp,
  "last_answered_at" timestamp,
  "last_incorrect_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "question_states"
ADD CONSTRAINT "question_states_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "question_states"
ADD CONSTRAINT "question_states_question_id_quiz_questions_id_fk"
FOREIGN KEY ("question_id")
REFERENCES "public"."quiz_questions"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX "question_states_user_question_uidx"
ON "question_states" ("user_id", "question_id");--> statement-breakpoint

CREATE INDEX "question_states_user_correct_idx"
ON "question_states" ("user_id", "latest_is_correct");--> statement-breakpoint

CREATE INDEX "question_states_user_answered_idx"
ON "question_states" ("user_id", "last_answered_at");--> statement-breakpoint

CREATE TABLE "question_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "selected_option_id" varchar(100) NOT NULL,
  "is_correct" boolean NOT NULL,
  "attempted_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "question_attempts"
ADD CONSTRAINT "question_attempts_question_id_quiz_questions_id_fk"
FOREIGN KEY ("question_id")
REFERENCES "public"."quiz_questions"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "question_attempts_user_question_attempted_idx"
ON "question_attempts" ("user_id", "question_id", "attempted_at");
