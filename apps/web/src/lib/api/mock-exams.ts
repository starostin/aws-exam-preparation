import { apiClient } from './client';

export interface MockExamSummary {
  id: string;
  certificationId: string;
  certificationCode: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
}

export interface MockExamAttemptHistoryItem {
  attemptId: string;
  mockExamId: string;
  mockExamTitle: string;
  certificationId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  startedAt: string;
  completedAt: string | null;
}

export interface StartMockExamAttemptResponse {
  attemptId: string;
  mockExamId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  durationMinutes: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt: string;
}

export interface MockExamAttemptProgressResponse {
  attemptId: string;
  mockExamId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  durationMinutes: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
}

export interface MockExamAttemptQuestionItem {
  attemptQuestionId: string;
  questionOrder: number;
  selectedOptionId: string | null;
  answeredAt: string | null;
  question: {
    id: string;
    topicId: string;
    topicTitle: string;
    domainName: string;
    text: string;
    options: Array<{ id: string; text: string }>;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface MockExamQuestionsPageResponse {
  attemptId: string;
  page: number;
  pageSize: number;
  totalQuestions: number;
  items: MockExamAttemptQuestionItem[];
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
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  reviewItems: MockExamReviewItem[];
}

export async function fetchMockExams(token: string, certificationId?: string): Promise<MockExamSummary[]> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();

  return apiClient.get<MockExamSummary[]>(`/v1/mock-exams${query ? `?${query}` : ''}`, { token });
}

export async function fetchMockExamAttemptHistory(
  token: string,
  certificationId?: string,
): Promise<MockExamAttemptHistoryItem[]> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();

  return apiClient.get<MockExamAttemptHistoryItem[]>(`/v1/mock-exams/attempts/history${query ? `?${query}` : ''}`, { token });
}

export async function startMockExamAttempt(token: string, mockExamId: string): Promise<StartMockExamAttemptResponse> {
  return apiClient.post<StartMockExamAttemptResponse>(`/v1/mock-exams/${mockExamId}/attempts`, {}, { token });
}

export async function fetchMockExamAttempt(
  token: string,
  attemptId: string,
): Promise<MockExamAttemptProgressResponse> {
  return apiClient.get<MockExamAttemptProgressResponse>(`/v1/mock-exams/attempts/${attemptId}`, { token });
}

export async function fetchMockExamQuestions(
  token: string,
  attemptId: string,
  page: number,
  pageSize = 1,
): Promise<MockExamQuestionsPageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiClient.get<MockExamQuestionsPageResponse>(`/v1/mock-exams/attempts/${attemptId}/questions?${params.toString()}`, { token });
}

export async function submitMockExamAnswer(
  token: string,
  attemptId: string,
  input: SubmitMockExamAnswerInput,
): Promise<SubmitMockExamAnswerResponse> {
  return apiClient.post<SubmitMockExamAnswerResponse>(`/v1/mock-exams/attempts/${attemptId}/answers`, input, { token });
}

export async function completeMockExamAttempt(
  token: string,
  attemptId: string,
): Promise<CompleteMockExamAttemptResponse> {
  return apiClient.post<CompleteMockExamAttemptResponse>(`/v1/mock-exams/attempts/${attemptId}/complete`, {}, { token });
}
