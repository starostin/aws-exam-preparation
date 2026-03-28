import type { QuestionDifficulty, QuizMode } from '@aws-exam-prep/types';

type SearchParamsReader = {
  get(name: string): string | null;
};

export const DIFFICULTY_OPTIONS: Array<{ value: 'all' | QuestionDifficulty; label: string }> = [
  { value: 'all', label: 'All difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const LIMIT_OPTIONS = [5, 10, 15, 20] as const;

export interface QuizSetupState {
  mode: QuizMode;
  topicId: string;
  difficulty: 'all' | QuestionDifficulty;
  questionLimit: number;
}

export function parseQuizSetupState(searchParams: SearchParamsReader): QuizSetupState {
  const queryMode = searchParams.get('mode');
  const queryTopicId = searchParams.get('topicId');
  const queryDifficulty = searchParams.get('difficulty');
  const queryLimit = Number(searchParams.get('limit'));

  const mode: QuizMode = queryMode === 'mixed' ? 'mixed' : 'topic';
  const difficulty: 'all' | QuestionDifficulty =
    queryDifficulty === 'easy' || queryDifficulty === 'medium' || queryDifficulty === 'hard'
      ? queryDifficulty
      : 'all';
  const questionLimit = LIMIT_OPTIONS.includes(queryLimit as (typeof LIMIT_OPTIONS)[number]) ? queryLimit : 10;

  return {
    mode,
    topicId: queryTopicId && queryTopicId.length > 0 ? queryTopicId : 'none',
    difficulty,
    questionLimit,
  };
}

export function buildQuizSessionHref(state: QuizSetupState): string {
  const params = new URLSearchParams();

  params.set('mode', state.mode);
  params.set('limit', String(state.questionLimit));

  if (state.mode === 'topic' && state.topicId !== 'none') {
    params.set('topicId', state.topicId);
  }

  if (state.difficulty !== 'all') {
    params.set('difficulty', state.difficulty);
  }

  return `/quizzes/session?${params.toString()}`;
}

export function buildQuizSetupHref(state: QuizSetupState): string {
  const params = new URLSearchParams();

  params.set('mode', state.mode);

  if (state.mode === 'topic' && state.topicId !== 'none') {
    params.set('topicId', state.topicId);
  }

  if (state.difficulty !== 'all') {
    params.set('difficulty', state.difficulty);
  }

  params.set('limit', String(state.questionLimit));

  return `/quizzes?${params.toString()}`;
}