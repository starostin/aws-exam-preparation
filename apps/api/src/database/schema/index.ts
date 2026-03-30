import { pgTable, uuid, varchar, text, timestamp, boolean, integer, real, date, jsonb, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

// ─── Enumerations ──────────────────────────────────────────────────────────────

export const topicStatusEnum = pgEnum('topic_status', ['not_started', 'in_progress', 'completed']);
export const taskTypeEnum = pgEnum('task_type', ['read', 'quiz', 'flashcard', 'mock_exam', 'review', 'course', 'video']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'carried_over']);
export const mockExamStatusEnum = pgEnum('mock_exam_status', ['not_started', 'in_progress', 'completed']);
export const questionDifficultyEnum = pgEnum('question_difficulty', ['easy', 'medium', 'hard']);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // matches Supabase Auth user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Certifications ───────────────────────────────────────────────────────────

export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. SAA-C03
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull().default('AWS'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Domains ──────────────────────────────────────────────────────────────────

export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificationId: uuid('certification_id').notNull().references(() => certifications.id),
  name: varchar('name', { length: 255 }).notNull(),
  weightPercent: real('weight_percent').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Topics ───────────────────────────────────────────────────────────────────

export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  domainId: uuid('domain_id').notNull().references(() => domains.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── User Topic Status ────────────────────────────────────────────────────────

export const userTopicStatus = pgTable('user_topic_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  topicId: uuid('topic_id').notNull().references(() => topics.id),
  status: topicStatusEnum('status').notNull().default('not_started'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Study Plans ──────────────────────────────────────────────────────────────

export const studyPlans = pgTable('study_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  certificationId: uuid('certification_id').notNull().references(() => certifications.id),
  targetDate: date('target_date').notNull(),
  dailyHours: real('daily_hours').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Study Tasks ──────────────────────────────────────────────────────────────

export const studyTasks = pgTable('study_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  studyPlanId: uuid('study_plan_id').notNull().references(() => studyPlans.id),
  topicId: uuid('topic_id').references(() => topics.id),
  externalResourceId: uuid('external_resource_id'),
  title: varchar('title', { length: 255 }),
  type: taskTypeEnum('type').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  scheduledDate: date('scheduled_date').notNull(),
  plannedMinutes: integer('planned_minutes'),
  sortOrder: integer('sort_order'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Quiz Questions ───────────────────────────────────────────────────────────

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').notNull().references(() => topics.id),
  text: text('text').notNull(),
  options: jsonb('options').notNull(), // QuizOption[]
  explanation: text('explanation').notNull(),
  difficulty: questionDifficultyEnum('difficulty').notNull().default('medium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  questionId: uuid('question_id').notNull().references(() => quizQuestions.id),
  selectedOptionId: varchar('selected_option_id', { length: 100 }).notNull(),
  isCorrect: boolean('is_correct').notNull(),
  attemptedAt: timestamp('attempted_at').defaultNow().notNull(),
});

// ─── Mock Exams ───────────────────────────────────────────────────────────────

export const mockExams = pgTable('mock_exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificationId: uuid('certification_id').notNull().references(() => certifications.id),
  title: varchar('title', { length: 255 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Mock Exam Attempts ───────────────────────────────────────────────────────

export const mockExamAttempts = pgTable('mock_exam_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  mockExamId: uuid('mock_exam_id').notNull().references(() => mockExams.id),
  status: mockExamStatusEnum('status').notNull().default('not_started'),
  score: real('score'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const mockExamQuestions = pgTable('mock_exam_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  mockExamId: uuid('mock_exam_id').notNull().references(() => mockExams.id),
  topicId: uuid('topic_id').notNull().references(() => topics.id),
  text: text('text').notNull(),
  options: jsonb('options').notNull(),
  explanation: text('explanation').notNull(),
  difficulty: questionDifficultyEnum('difficulty').notNull().default('medium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mockExamAttemptQuestions = pgTable('mock_exam_attempt_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id').notNull().references(() => mockExamAttempts.id),
  questionId: uuid('question_id').notNull().references(() => mockExamQuestions.id),
  questionOrder: integer('question_order').notNull(),
  selectedOptionId: varchar('selected_option_id', { length: 100 }),
  isCorrect: boolean('is_correct'),
  answeredAt: timestamp('answered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueAttemptOrder: uniqueIndex('mock_exam_attempt_questions_attempt_order_uidx').on(table.attemptId, table.questionOrder),
  uniqueAttemptQuestion: uniqueIndex('mock_exam_attempt_questions_attempt_question_uidx').on(table.attemptId, table.questionId),
}));

// ─── Flashcards ───────────────────────────────────────────────────────────────

export const flashcards = pgTable('flashcards', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').notNull().references(() => topics.id),
  front: text('front').notNull(),
  back: text('back').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Review Schedules ─────────────────────────────────────────────────────────

export const reviewSchedules = pgTable('review_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  flashcardId: uuid('flashcard_id').notNull().references(() => flashcards.id),
  nextReviewAt: timestamp('next_review_at').notNull(),
  confidence: integer('confidence').notNull().default(1), // 1–5
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Progress Snapshots ───────────────────────────────────────────────────────

export const progressSnapshots = pgTable('progress_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  certificationId: uuid('certification_id').notNull().references(() => certifications.id),
  topicsCompleted: integer('topics_completed').notNull().default(0),
  topicsTotal: integer('topics_total').notNull().default(0),
  quizAccuracy: real('quiz_accuracy').notNull().default(0),
  mockExamAvgScore: real('mock_exam_avg_score').notNull().default(0),
  studyTimeMinutes: integer('study_time_minutes').notNull().default(0),
  snapshotDate: date('snapshot_date').notNull(),
});

// ─── Readiness Scores ─────────────────────────────────────────────────────────

export const readinessScores = pgTable('readiness_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  certificationId: uuid('certification_id').notNull().references(() => certifications.id),
  score: real('score').notNull().default(0), // 0–100
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
});

// ─── User Achievements ────────────────────────────────────────────────────────

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

// ─── External Resources ───────────────────────────────────────────────────────

export const externalResources = pgTable('external_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificationId: uuid('certification_id').references(() => certifications.id),
  topicId: uuid('topic_id').references(() => topics.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  url: text('url').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // course | docs | video | practice_test
  isFree: boolean('is_free').notNull().default(true),
  provider: varchar('provider', { length: 100 }),
  level: varchar('level', { length: 30 }), // beginner | intermediate | advanced | mixed
  priority: integer('priority').notNull().default(50), // 0-100, higher means more important
  tags: jsonb('tags').$type<string[]>().notNull(),
  estimatedMinutes: integer('estimated_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
