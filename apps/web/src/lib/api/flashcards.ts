import { apiClient } from './client';
import type {
  FlashcardStatsResponse,
  FlashcardTopicSummary,
  FlashcardWithReview,
  ListFlashcardsInput,
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

export async function fetchFlashcardStats(
  token: string,
  certificationId?: string,
): Promise<FlashcardStatsResponse> {
  const params = new URLSearchParams();
  if (certificationId) params.set('certificationId', certificationId);
  const query = params.toString();
  return apiClient.get<FlashcardStatsResponse>(`/v1/flashcards/stats${query ? `?${query}` : ''}`, { token });
}
