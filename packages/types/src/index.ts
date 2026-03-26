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

export type TaskType = "read" | "quiz" | "flashcard" | "mock_exam" | "review";
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
  type: TaskType;
  status: TaskStatus;
  scheduledDate: string; // ISO date
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
