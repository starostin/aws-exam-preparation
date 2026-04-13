import { apiClient } from './client';
import type {
  CompleteFlashcardSessionResponse,
  FlashcardSessionCardsPageResponse,
  FlashcardSessionProgressResponse,
  FlashcardSessionSummary,
  FlashcardStatsResponse,
  FlashcardTopicSummary,
  FlashcardWithReview,
  ListFlashcardsInput,
  ResetFlashcardStatsResponse,
  StartFlashcardSessionInput,
  SubmitReviewInput,
  SubmitReviewResponse,
} from '@aws-exam-prep/types';

function buildFlashcardsQuery(input: ListFlashcardsInput): string {
  const params = new URLSearchParams();
  if (input.topicId) params.set('topicId', input.topicId);
  if (input.certificationId) params.set('certificationId', input.certificationId);
  if (input.dueOnly) params.set('dueOnly', 'true');
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchFlashcardTopics(
  token: string,
  certificationId?: string,
): Promise<FlashcardTopicSummary[]> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();
  return apiClient.get<FlashcardTopicSummary[]>(`/v1/flashcards/topics${query ? `?${query}` : ''}`, { token });
}

export async function fetchFlashcards(
  token: string,
  input: ListFlashcardsInput,
): Promise<FlashcardWithReview[]> {
  return apiClient.get<FlashcardWithReview[]>(`/v1/flashcards${buildFlashcardsQuery(input)}`, { token });
}

export async function fetchDueFlashcards(
  token: string,
  topicId?: string,
): Promise<FlashcardWithReview[]> {
  const params = new URLSearchParams();
  if (topicId) params.set('topicId', topicId);
  const query = params.toString();
  return apiClient.get<FlashcardWithReview[]>(`/v1/flashcards/due${query ? `?${query}` : ''}`, { token });
}

export async function submitFlashcardReview(
  token: string,
  input: SubmitReviewInput,
): Promise<SubmitReviewResponse> {
  return apiClient.post<SubmitReviewResponse>('/v1/flashcards/review', input, { token });
}

export async function fetchFlashcardSessionHistory(
  token: string,
  certificationId?: string,
): Promise<FlashcardSessionSummary[]> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();
  return apiClient.get<FlashcardSessionSummary[]>(`/v1/flashcards/sessions/history${query ? `?${query}` : ''}`, { token });
}

export async function startFlashcardSession(
  token: string,
  input: StartFlashcardSessionInput,
): Promise<FlashcardSessionProgressResponse> {
  return apiClient.post<FlashcardSessionProgressResponse>('/v1/flashcards/sessions/start', input, { token });
}

export async function fetchFlashcardSession(
  token: string,
  sessionId: string,
): Promise<FlashcardSessionProgressResponse> {
  return apiClient.get<FlashcardSessionProgressResponse>(`/v1/flashcards/sessions/${sessionId}`, { token });
}

export async function fetchFlashcardSessionCards(
  token: string,
  sessionId: string,
  page: number,
  pageSize = 200,
): Promise<FlashcardSessionCardsPageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiClient.get<FlashcardSessionCardsPageResponse>(`/v1/flashcards/sessions/${sessionId}/cards?${params.toString()}`, { token });
}

export async function submitFlashcardSessionReview(
  token: string,
  sessionId: string,
  input: SubmitReviewInput,
): Promise<SubmitReviewResponse> {
  return apiClient.post<SubmitReviewResponse>(`/v1/flashcards/sessions/${sessionId}/review`, input, { token });
}

export async function completeFlashcardSession(
  token: string,
  sessionId: string,
): Promise<CompleteFlashcardSessionResponse> {
  return apiClient.post<CompleteFlashcardSessionResponse>(`/v1/flashcards/sessions/${sessionId}/complete`, {}, { token });
}

export async function fetchFlashcardStats(
  token: string,
  certificationId?: string,
): Promise<FlashcardStatsResponse> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();
  return apiClient.get<FlashcardStatsResponse>(`/v1/flashcards/stats${query ? `?${query}` : ''}`, { token });
}

export async function resetFlashcardStats(token: string): Promise<ResetFlashcardStatsResponse> {
  return apiClient.patch<ResetFlashcardStatsResponse>('/v1/flashcards/stats/reset', {}, { token });
}
