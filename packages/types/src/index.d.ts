export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface ApiError {
    statusCode: number;
    message: string;
    correlationId?: string;
}
export interface Certification {
    id: string;
    code: string;
    name: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
}
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
export type TaskType = "read" | "quiz" | "flashcard" | "mock_exam" | "review" | "course" | "video";
export type TaskStatus = "pending" | "in_progress" | "completed" | "carried_over";
export interface StudyPlan {
    id: string;
    userId: string;
    certificationId: string;
    targetDate: string;
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
    scheduledDate: string;
    plannedMinutes?: number;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}
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
export interface ProgressSnapshot {
    id: string;
    userId: string;
    certificationId: string;
    topicsCompleted: number;
    topicsTotal: number;
    quizAccuracy: number;
    mockExamAvgScore: number;
    studyTimeMinutes: number;
    snapshotDate: string;
}
export interface ReadinessScore {
    id: string;
    userId: string;
    certificationId: string;
    score: number;
    calculatedAt: string;
}
export interface User {
    id: string;
    email: string;
    displayName?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateStudyPlanInput {
    certificationId: string;
    targetDate: string;
    dailyHours: number;
    selectedMaterialIds?: string[];
}
export interface UpdateTaskStatusInput {
    status: "pending" | "in_progress" | "completed";
}
export interface RescheduleTaskInput {
    targetDate: string;
}
export interface DashboardStats {
    streak: number;
    topicsCompleted: number;
    totalTopics: number;
    completedTasksTotal: number;
    readinessScore: number | null;
    quizAccuracy: number | null;
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
    startDate: string;
    endDate: string;
    tasks: StudyTaskItem[];
}
export interface PlanScheduleResponse {
    weeks: WeekSchedule[];
}
//# sourceMappingURL=index.d.ts.map