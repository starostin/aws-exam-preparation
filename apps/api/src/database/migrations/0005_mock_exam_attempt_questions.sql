CREATE TABLE "mock_exam_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "mock_exam_id" uuid NOT NULL,
  "topic_id" uuid NOT NULL,
  "text" text NOT NULL,
  "options" jsonb NOT NULL,
  "explanation" text NOT NULL,
  "difficulty" "question_difficulty" DEFAULT 'medium' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "mock_exam_questions"
ADD CONSTRAINT "mock_exam_questions_mock_exam_id_mock_exams_id_fk"
FOREIGN KEY ("mock_exam_id")
REFERENCES "public"."mock_exams"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "mock_exam_questions"
ADD CONSTRAINT "mock_exam_questions_topic_id_topics_id_fk"
FOREIGN KEY ("topic_id")
REFERENCES "public"."topics"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE TABLE "mock_exam_attempt_questions" (
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

ALTER TABLE "mock_exam_attempt_questions"
ADD CONSTRAINT "mock_exam_attempt_questions_attempt_id_mock_exam_attempts_id_fk"
FOREIGN KEY ("attempt_id")
REFERENCES "public"."mock_exam_attempts"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "mock_exam_attempt_questions"
ADD CONSTRAINT "mock_exam_attempt_questions_question_id_mock_exam_questions_id_fk"
FOREIGN KEY ("question_id")
REFERENCES "public"."mock_exam_questions"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX "mock_exam_attempt_questions_attempt_order_uidx"
ON "mock_exam_attempt_questions" ("attempt_id", "question_order");--> statement-breakpoint

CREATE UNIQUE INDEX "mock_exam_attempt_questions_attempt_question_uidx"
ON "mock_exam_attempt_questions" ("attempt_id", "question_id");