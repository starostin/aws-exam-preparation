import { apiClient } from './client';
import type {
  CompleteMockExamAttemptResponse,
  MockExamAttemptHistoryItem,
  MockExamAttemptProgressResponse,
  MockExamQuestionsPageResponse,
  MockExamStatsResponse,
  MockExamSummary,
  ResetMockExamStatsResponse,
  StartMockExamAttemptResponse,
  SubmitMockExamAnswerInput,
  SubmitMockExamAnswerResponse,
} from '@aws-exam-prep/types';

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

export async function fetchMockExamStats(token: string): Promise<MockExamStatsResponse> {
  return apiClient.get<MockExamStatsResponse>('/v1/mock-exams/stats', { token });
}

export async function resetMockExamStats(token: string): Promise<ResetMockExamStatsResponse> {
  return apiClient.patch<ResetMockExamStatsResponse>('/v1/mock-exams/stats/reset', {}, { token });
}
