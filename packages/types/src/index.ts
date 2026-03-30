// API pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Standard API error shape
export interface ApiError {
  statusCode: number;
  message: string;
  correlationId?: string;
}

// ─── Certifications ───────────────────────────────────────────────────────────

export interface Certification {
  id: string;
  code: string; // e.g. "SAA-C03"
  name: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Domains & Topics ─────────────────────────────────────────────────────────

export interface Domain {
  id: string;
  certificationId: string;
  name: string;
  weightPercent: number;
  createdAt: string;
  updatedAt: string;
}

export type TopicStatus = "not_started" | "in_progress" | "completed";

export interface Topic {
  id: string;
  domainId: string;
  title: string;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Study Plans & Tasks ──────────────────────────────────────────────────────

export type TaskType = "read" | "quiz" | "flashcard" | "mock_exam" | "review" | "course" | "video";
export type TaskStatus = "pending" | "in_progress" | "completed" | "carried_over";

export interface StudyPlan {
  id: string;
  userId: string;
  certificationId: string;
  targetDate: string; // ISO date
  dailyHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  studyPlanId: string;
  topicId?: string;
  externalResourceId?: string;
  title?: string;
  type: TaskType;
  status: TaskStatus;
  scheduledDate: string; // ISO date
  plannedMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  topicId: string;
  text: string;
  options: QuizOption[];
  explanation: string;
  difficulty: QuestionDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  attemptedAt: string;
}

export type QuizMode = "topic" | "mixed";

export interface QuizTopicSummary {
  topicId: string;
  topicTitle: string;
  domainName: string;
  questionCount: number;
}

export interface ListQuizQuestionsInput {
  mode?: QuizMode;
  topicId?: string;
  certificationId?: string;
  difficulty?: QuestionDifficulty;
  limit?: number;
}

export interface PublicQuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionItem {
  id: string;
  topicId: string;
  topicTitle: string;
  domainName: string;
  text: string;
  options: PublicQuizOption[];
  difficulty: QuestionDifficulty;
}

export interface SubmitQuizAttemptInput {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitQuizAttemptResponse {
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  topicId: string;
  topicTitle: string | null;
  difficulty: QuestionDifficulty;
  attemptedAt: string;
}

export interface QuizTopicStats {
  topicId: string;
  topicTitle: string;
  attempts: number;
  correct: number;
  accuracy: number;
}

export interface QuizStatsResponse {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number | null;
  byTopic: QuizTopicStats[];
}

// ─── Mock Exams ───────────────────────────────────────────────────────────────

export type MockExamStatus = "not_started" | "in_progress" | "completed";

export interface MockExam {
  id: string;
  certificationId: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockExamAttempt {
  id: string;
  userId: string;
  mockExamId: string;
  status: MockExamStatus;
  score?: number;
  startedAt: string;
  completedAt?: string;
}

export interface MockExamSummary {
  id: string;
  certificationId: string;
  certificationCode: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
}

export interface MockExamQuestionItem {
  id: string;
  topicId: string;
  topicTitle: string;
  domainName: string;
  text: string;
  options: PublicQuizOption[];
  difficulty: QuestionDifficulty;
}

export interface MockExamAttemptQuestionItem {
  attemptQuestionId: string;
  questionOrder: number;
  selectedOptionId: string | null;
  answeredAt: string | null;
  question: MockExamQuestionItem;
}

export interface MockExamQuestionsPageResponse {
  attemptId: string;
  page: number;
  pageSize: number;
  totalQuestions: number;
  items: MockExamAttemptQuestionItem[];
}

export interface StartMockExamAttemptResponse {
  attemptId: string;
  mockExamId: string;
  title: string;
  status: MockExamStatus;
  durationMinutes: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt: string;
}

export interface SubmitMockExamAnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitMockExamAnswerResponse {
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  answeredAt: string;
}

export interface MockExamReviewItem {
  questionId: string;
  questionOrder: number;
  topicTitle: string;
  domainName: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  explanation: string;
  isCorrect: boolean;
}

export interface CompleteMockExamAttemptResponse {
  attemptId: string;
  status: MockExamStatus;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  reviewItems: MockExamReviewItem[];
}

export interface MockExamAttemptProgressResponse {
  attemptId: string;
  mockExamId: string;
  title: string;
  status: MockExamStatus;
  durationMinutes: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
}

export interface MockExamAttemptHistoryItem {
  attemptId: string;
  mockExamId: string;
  mockExamTitle: string;
  certificationId: string;
  status: MockExamStatus;
  score: number | null;
  startedAt: string;
  completedAt: string | null;
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export type FlashcardConfidence = 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSchedule {
  id: string;
  userId: string;
  flashcardId: string;
  nextReviewAt: string;
  confidence: FlashcardConfidence;
  updatedAt: string;
}

export interface FlashcardTopicSummary {
  topicId: string;
  topicTitle: string;
  domainName: string;
  cardCount: number;
  dueCount: number;
}

export interface FlashcardWithReview {
  id: string;
  topicId: string;
  topicTitle: string;
  front: string;
  back: string;
  nextReviewAt: string | null;
  confidence: FlashcardConfidence | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListFlashcardsInput {
  topicId?: string;
  certificationId?: string;
  dueOnly?: boolean;
}

export interface SubmitReviewInput {
  flashcardId: string;
  confidence: FlashcardConfidence;
}

export interface SubmitReviewResponse {
  reviewId: string;
  flashcardId: string;
  confidence: FlashcardConfidence;
  nextReviewAt: string;
  updatedAt: string;
}

export interface FlashcardStatsResponse {
  totalCards: number;
  reviewedCards: number;
  dueToday: number;
  averageConfidence: number | null;
}

// ─── Progress & Readiness ─────────────────────────────────────────────────────

export interface ProgressSnapshot {
  id: string;
  userId: string;
  certificationId: string;
  topicsCompleted: number;
  topicsTotal: number;
  quizAccuracy: number; // 0–1
  mockExamAvgScore: number; // 0–1
  studyTimeMinutes: number;
  snapshotDate: string;
}

export interface ReadinessScore {
  id: string;
  userId: string;
  certificationId: string;
  score: number; // 0–100
  calculatedAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string; // Supabase Auth user ID
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface CreateStudyPlanInput {
  certificationId: string;
  targetDate: string; // ISO date string YYYY-MM-DD
  dailyHours: number;
  selectedMaterialIds?: string[];
}

export interface UpdateTaskStatusInput {
  status: "pending" | "in_progress" | "completed";
}

export interface RescheduleTaskInput {
  targetDate: string; // ISO date string YYYY-MM-DD
}

export interface DashboardStats {
  streak: number;
  topicsCompleted: number;
  totalTopics: number;
  completedTasksTotal: number;
  readinessScore: number | null;
  quizAccuracy: number | null; // 0–1, null if no attempts
}

export interface StudyTaskItem {
  id: string;
  topicId: string | null;
  type: TaskType;
  status: TaskStatus;
  scheduledDate: string;
  topicTitle: string | null;
  title: string | null;
  courseName: string | null;
  externalResourceId: string | null;
  topicResourceUrl: string | null;
  estimatedMinutes: number;
}

export interface DashboardStudyPlan {
  id: string;
  certificationId: string;
  certificationName: string;
  certificationCode: string;
  targetDate: string;
  startDate: string;
  dailyHours: number;
}

export interface UpcomingDay {
  date: string;
  tasks: StudyTaskItem[];
}

export interface DashboardResponse {
  studyPlan: DashboardStudyPlan | null;
  todaysTasks: StudyTaskItem[];
  carryOverTasks: StudyTaskItem[];
  upcomingTasks: UpcomingDay[];
  stats: DashboardStats;
}

export interface WeekSchedule {
  weekNumber: number;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;   // ISO date YYYY-MM-DD
  tasks: StudyTaskItem[];
}

export interface PlanScheduleResponse {
  weeks: WeekSchedule[];
}
