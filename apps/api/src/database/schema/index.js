"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalResources = exports.userAchievements = exports.readinessScores = exports.progressSnapshots = exports.reviewSchedules = exports.flashcards = exports.mockExamAttempts = exports.mockExams = exports.quizAttempts = exports.quizQuestions = exports.studyTasks = exports.studyPlans = exports.userTopicStatus = exports.topics = exports.domains = exports.certifications = exports.users = exports.questionDifficultyEnum = exports.mockExamStatusEnum = exports.taskStatusEnum = exports.taskTypeEnum = exports.topicStatusEnum = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ─── Enumerations ──────────────────────────────────────────────────────────────
exports.topicStatusEnum = (0, pg_core_1.pgEnum)('topic_status', ['not_started', 'in_progress', 'completed']);
exports.taskTypeEnum = (0, pg_core_1.pgEnum)('task_type', ['read', 'quiz', 'flashcard', 'mock_exam', 'review']);
exports.taskStatusEnum = (0, pg_core_1.pgEnum)('task_status', ['pending', 'in_progress', 'completed', 'carried_over']);
exports.mockExamStatusEnum = (0, pg_core_1.pgEnum)('mock_exam_status', ['not_started', 'in_progress', 'completed']);
exports.questionDifficultyEnum = (0, pg_core_1.pgEnum)('question_difficulty', ['easy', 'medium', 'hard']);
// ─── Users ────────────────────────────────────────────────────────────────────
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey(), // matches Supabase Auth user ID
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    displayName: (0, pg_core_1.varchar)('display_name', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Certifications ───────────────────────────────────────────────────────────
exports.certifications = (0, pg_core_1.pgTable)('certifications', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull().unique(), // e.g. SAA-C03
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    provider: (0, pg_core_1.varchar)('provider', { length: 100 }).notNull().default('AWS'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Domains ──────────────────────────────────────────────────────────────────
exports.domains = (0, pg_core_1.pgTable)('domains', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    certificationId: (0, pg_core_1.uuid)('certification_id').notNull().references(function () { return exports.certifications.id; }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    weightPercent: (0, pg_core_1.real)('weight_percent').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Topics ───────────────────────────────────────────────────────────────────
exports.topics = (0, pg_core_1.pgTable)('topics', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    domainId: (0, pg_core_1.uuid)('domain_id').notNull().references(function () { return exports.domains.id; }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── User Topic Status ────────────────────────────────────────────────────────
exports.userTopicStatus = (0, pg_core_1.pgTable)('user_topic_status', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    topicId: (0, pg_core_1.uuid)('topic_id').notNull().references(function () { return exports.topics.id; }),
    status: (0, exports.topicStatusEnum)('status').notNull().default('not_started'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Study Plans ──────────────────────────────────────────────────────────────
exports.studyPlans = (0, pg_core_1.pgTable)('study_plans', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    certificationId: (0, pg_core_1.uuid)('certification_id').notNull().references(function () { return exports.certifications.id; }),
    targetDate: (0, pg_core_1.date)('target_date').notNull(),
    dailyHours: (0, pg_core_1.real)('daily_hours').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Study Tasks ──────────────────────────────────────────────────────────────
exports.studyTasks = (0, pg_core_1.pgTable)('study_tasks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    studyPlanId: (0, pg_core_1.uuid)('study_plan_id').notNull().references(function () { return exports.studyPlans.id; }),
    topicId: (0, pg_core_1.uuid)('topic_id').references(function () { return exports.topics.id; }),
    type: (0, exports.taskTypeEnum)('type').notNull(),
    status: (0, exports.taskStatusEnum)('status').notNull().default('pending'),
    scheduledDate: (0, pg_core_1.date)('scheduled_date').notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Quiz Questions ───────────────────────────────────────────────────────────
exports.quizQuestions = (0, pg_core_1.pgTable)('quiz_questions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    topicId: (0, pg_core_1.uuid)('topic_id').notNull().references(function () { return exports.topics.id; }),
    text: (0, pg_core_1.text)('text').notNull(),
    options: (0, pg_core_1.jsonb)('options').notNull(), // QuizOption[]
    explanation: (0, pg_core_1.text)('explanation').notNull(),
    difficulty: (0, exports.questionDifficultyEnum)('difficulty').notNull().default('medium'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Quiz Attempts ────────────────────────────────────────────────────────────
exports.quizAttempts = (0, pg_core_1.pgTable)('quiz_attempts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    questionId: (0, pg_core_1.uuid)('question_id').notNull().references(function () { return exports.quizQuestions.id; }),
    selectedOptionId: (0, pg_core_1.varchar)('selected_option_id', { length: 100 }).notNull(),
    isCorrect: (0, pg_core_1.boolean)('is_correct').notNull(),
    attemptedAt: (0, pg_core_1.timestamp)('attempted_at').defaultNow().notNull(),
});
// ─── Mock Exams ───────────────────────────────────────────────────────────────
exports.mockExams = (0, pg_core_1.pgTable)('mock_exams', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    certificationId: (0, pg_core_1.uuid)('certification_id').notNull().references(function () { return exports.certifications.id; }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes').notNull(),
    totalQuestions: (0, pg_core_1.integer)('total_questions').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Mock Exam Attempts ───────────────────────────────────────────────────────
exports.mockExamAttempts = (0, pg_core_1.pgTable)('mock_exam_attempts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    mockExamId: (0, pg_core_1.uuid)('mock_exam_id').notNull().references(function () { return exports.mockExams.id; }),
    status: (0, exports.mockExamStatusEnum)('status').notNull().default('not_started'),
    score: (0, pg_core_1.real)('score'),
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
});
// ─── Flashcards ───────────────────────────────────────────────────────────────
exports.flashcards = (0, pg_core_1.pgTable)('flashcards', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    topicId: (0, pg_core_1.uuid)('topic_id').notNull().references(function () { return exports.topics.id; }),
    front: (0, pg_core_1.text)('front').notNull(),
    back: (0, pg_core_1.text)('back').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Review Schedules ─────────────────────────────────────────────────────────
exports.reviewSchedules = (0, pg_core_1.pgTable)('review_schedules', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    flashcardId: (0, pg_core_1.uuid)('flashcard_id').notNull().references(function () { return exports.flashcards.id; }),
    nextReviewAt: (0, pg_core_1.timestamp)('next_review_at').notNull(),
    confidence: (0, pg_core_1.integer)('confidence').notNull().default(1), // 1–5
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Progress Snapshots ───────────────────────────────────────────────────────
exports.progressSnapshots = (0, pg_core_1.pgTable)('progress_snapshots', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    certificationId: (0, pg_core_1.uuid)('certification_id').notNull().references(function () { return exports.certifications.id; }),
    topicsCompleted: (0, pg_core_1.integer)('topics_completed').notNull().default(0),
    topicsTotal: (0, pg_core_1.integer)('topics_total').notNull().default(0),
    quizAccuracy: (0, pg_core_1.real)('quiz_accuracy').notNull().default(0),
    mockExamAvgScore: (0, pg_core_1.real)('mock_exam_avg_score').notNull().default(0),
    studyTimeMinutes: (0, pg_core_1.integer)('study_time_minutes').notNull().default(0),
    snapshotDate: (0, pg_core_1.date)('snapshot_date').notNull(),
});
// ─── Readiness Scores ─────────────────────────────────────────────────────────
exports.readinessScores = (0, pg_core_1.pgTable)('readiness_scores', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    certificationId: (0, pg_core_1.uuid)('certification_id').notNull().references(function () { return exports.certifications.id; }),
    score: (0, pg_core_1.real)('score').notNull().default(0), // 0–100
    calculatedAt: (0, pg_core_1.timestamp)('calculated_at').defaultNow().notNull(),
});
// ─── User Achievements ────────────────────────────────────────────────────────
exports.userAchievements = (0, pg_core_1.pgTable)('user_achievements', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(function () { return exports.users.id; }),
    type: (0, pg_core_1.varchar)('type', { length: 100 }).notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    earnedAt: (0, pg_core_1.timestamp)('earned_at').defaultNow().notNull(),
});
// ─── External Resources ───────────────────────────────────────────────────────
exports.externalResources = (0, pg_core_1.pgTable)('external_resources', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    certificationId: (0, pg_core_1.uuid)('certification_id').references(function () { return exports.certifications.id; }),
    topicId: (0, pg_core_1.uuid)('topic_id').references(function () { return exports.topics.id; }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    url: (0, pg_core_1.text)('url').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(), // course | docs | video | practice_test
    isFree: (0, pg_core_1.boolean)('is_free').notNull().default(true),
    provider: (0, pg_core_1.varchar)('provider', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
