import { apiClient } from './client';
import type {
  ListQuizQuestionsInput,
  QuizQuestionItem,
  QuizStatsResponse,
  QuizTopicSummary,
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
