CREATE TYPE "flashcard_session_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint

CREATE TABLE "flashcard_review_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "certification_id" uuid NOT NULL,
  "topic_id" uuid,
  "filter" varchar(30) DEFAULT 'all' NOT NULL,
  "status" "flashcard_session_status" DEFAULT 'in_progress' NOT NULL,
  "total_cards" integer NOT NULL,
  "reviewed_cards" integer DEFAULT 0 NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "flashcard_review_session_cards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "flashcard_id" uuid NOT NULL,
  "card_order" integer NOT NULL,
  "confidence" integer,
  "reviewed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "flashcard_review_sessions"
ADD CONSTRAINT "flashcard_review_sessions_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "flashcard_review_sessions"
ADD CONSTRAINT "flashcard_review_sessions_certification_id_certifications_id_fk"
FOREIGN KEY ("certification_id")
REFERENCES "public"."certifications"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "flashcard_review_sessions"
ADD CONSTRAINT "flashcard_review_sessions_topic_id_topics_id_fk"
FOREIGN KEY ("topic_id")
REFERENCES "public"."topics"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "flashcard_review_session_cards"
ADD CONSTRAINT "flashcard_review_session_cards_session_id_flashcard_review_sessions_id_fk"
FOREIGN KEY ("session_id")
REFERENCES "public"."flashcard_review_sessions"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "flashcard_review_session_cards"
ADD CONSTRAINT "flashcard_review_session_cards_flashcard_id_flashcards_id_fk"
FOREIGN KEY ("flashcard_id")
REFERENCES "public"."flashcards"("id")
ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "flashcard_review_sessions_user_status_started_idx"
ON "flashcard_review_sessions" ("user_id", "status", "started_at");--> statement-breakpoint

CREATE INDEX "flashcard_review_sessions_user_cert_started_idx"
ON "flashcard_review_sessions" ("user_id", "certification_id", "started_at");--> statement-breakpoint

CREATE UNIQUE INDEX "flashcard_review_session_cards_session_order_uidx"
ON "flashcard_review_session_cards" ("session_id", "card_order");--> statement-breakpoint

CREATE UNIQUE INDEX "flashcard_review_session_cards_session_flashcard_uidx"
ON "flashcard_review_session_cards" ("session_id", "flashcard_id");--> statement-breakpoint

CREATE INDEX "flashcard_review_session_cards_session_reviewed_idx"
ON "flashcard_review_session_cards" ("session_id", "reviewed_at");
