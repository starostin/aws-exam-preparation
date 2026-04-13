import { apiClient } from './client';
import type {
  CompleteQuizAttemptResponse,
  ListQuizQuestionsInput,
  QuizAttemptProgressResponse,
  QuizAttemptQuestionsPageResponse,
  QuizAttemptSummary,
  QuizQuestionItem,
  ResetQuizStatsResponse,
  QuizStatsResponse,
  QuizTopicSummary,
  StartQuizAttemptInput,
  StartQuizAttemptResponse,
  SubmitQuizAnswerInput,
  SubmitQuizAnswerResponse,
  SubmitQuizAttemptInput,
  SubmitQuizAttemptResponse,
} from '@aws-exam-prep/types';

function buildQuestionsQuery(input: ListQuizQuestionsInput): string {
  const params = new URLSearchParams();

  if (input.mode) params.set('mode', input.mode);
  if (input.topicId) params.set('topicId', input.topicId);
  if (input.certificationId) params.set('certificationId', input.certificationId);
  if (input.difficulty) params.set('difficulty', input.difficulty);
  if (input.limit) params.set('limit', String(input.limit));

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchQuizTopics(token: string, certificationId?: string): Promise<QuizTopicSummary[]> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();
  return apiClient.get<QuizTopicSummary[]>(`/v1/quizzes/topics${query ? `?${query}` : ''}`, { token });
}

export async function fetchQuizQuestions(token: string, input: ListQuizQuestionsInput): Promise<QuizQuestionItem[]> {
  return apiClient.get<QuizQuestionItem[]>(`/v1/quizzes/questions${buildQuestionsQuery(input)}`, { token });
}

export async function fetchQuizAttemptHistory(token: string, certificationId?: string): Promise<QuizAttemptSummary[]> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();
  return apiClient.get<QuizAttemptSummary[]>(`/v1/quizzes/attempts/history${query ? `?${query}` : ''}`, { token });
}

export async function startQuizAttempt(
  token: string,
  input: StartQuizAttemptInput,
): Promise<StartQuizAttemptResponse> {
  return apiClient.post<StartQuizAttemptResponse>('/v1/quizzes/attempts/start', input, { token });
}

export async function fetchQuizAttempt(token: string, attemptId: string): Promise<QuizAttemptProgressResponse> {
  return apiClient.get<QuizAttemptProgressResponse>(`/v1/quizzes/attempts/${attemptId}`, { token });
}

export async function fetchQuizAttemptQuestions(
  token: string,
  attemptId: string,
  page: number,
  pageSize = 50,
): Promise<QuizAttemptQuestionsPageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiClient.get<QuizAttemptQuestionsPageResponse>(`/v1/quizzes/attempts/${attemptId}/questions?${params.toString()}`, { token });
}

export async function submitQuizAnswer(
  token: string,
  attemptId: string,
  input: SubmitQuizAnswerInput,
): Promise<SubmitQuizAnswerResponse> {
  return apiClient.post<SubmitQuizAnswerResponse>(`/v1/quizzes/attempts/${attemptId}/answers`, input, { token });
}

export async function completeQuizAttempt(
  token: string,
  attemptId: string,
): Promise<CompleteQuizAttemptResponse> {
  return apiClient.post<CompleteQuizAttemptResponse>(`/v1/quizzes/attempts/${attemptId}/complete`, {}, { token });
}

export async function submitQuizAttempt(
  token: string,
  input: SubmitQuizAttemptInput,
): Promise<SubmitQuizAttemptResponse> {
  return apiClient.post<SubmitQuizAttemptResponse>('/v1/quizzes/attempts', input, { token });
}

export async function fetchQuizStats(token: string, topicId?: string): Promise<QuizStatsResponse> {
  const params = new URLSearchParams();
  if (topicId) params.set('topicId', topicId);
  const query = params.toString();
  return apiClient.get<QuizStatsResponse>(`/v1/quizzes/stats${query ? `?${query}` : ''}`, { token });
}

export async function resetQuizStats(token: string): Promise<ResetQuizStatsResponse> {
  return apiClient.patch<ResetQuizStatsResponse>('/v1/quizzes/stats/reset', {}, { token });
}
