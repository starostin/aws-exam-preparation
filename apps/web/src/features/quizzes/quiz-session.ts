import type { QuestionDifficulty, QuizMode, QuizQuestionSelection, StartQuizAttemptInput } from '@aws-exam-prep/types';

type SearchParamsReader = {
  get(name: string): string | null;
};

export const DIFFICULTY_OPTIONS: Array<{ value: 'all' | QuestionDifficulty; label: string }> = [
  { value: 'all', label: 'All difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const QUESTION_SELECTION_OPTIONS: Array<{ value: QuizQuestionSelection; label: string }> = [
  { value: 'all', label: 'All questions' },
  { value: 'unanswered', label: 'Only unanswered' },
];

export const LIMIT_OPTIONS = [5, 10, 15, 20, 'all'] as const;

export interface QuizSetupState {
  mode: QuizMode;
  topicId: string;
  difficulty: 'all' | QuestionDifficulty;
  questionSelection: QuizQuestionSelection;
  questionLimit: number | 'all';
}

export function parseQuizSetupState(searchParams: SearchParamsReader): QuizSetupState {
  const queryMode = searchParams.get('mode');
  const queryTopicId = searchParams.get('topicId');
  const queryDifficulty = searchParams.get('difficulty');
  const querySelection = searchParams.get('selection');
  const queryLimit = searchParams.get('limit');

  const mode: QuizMode = queryMode === 'mixed' ? 'mixed' : 'topic';
  const difficulty: 'all' | QuestionDifficulty =
    queryDifficulty === 'easy' || queryDifficulty === 'medium' || queryDifficulty === 'hard'
      ? queryDifficulty
      : 'all';
  const questionSelection: QuizQuestionSelection = querySelection === 'unanswered' ? 'unanswered' : 'all';
  const questionLimit: number | 'all' = queryLimit === 'all'
    ? 'all'
    : LIMIT_OPTIONS.includes(Number(queryLimit) as (typeof LIMIT_OPTIONS)[number])
      ? Number(queryLimit)
      : 10;

  return {
    mode,
    topicId: queryTopicId && queryTopicId.length > 0 ? queryTopicId : 'none',
    difficulty,
    questionSelection,
    questionLimit,
  };
}

export function parseQuizAttemptId(searchParams: SearchParamsReader): string | null {
  const attemptId = searchParams.get('attemptId');
  return attemptId && attemptId.length > 0 ? attemptId : null;
}

export function buildStartQuizAttemptInput(state: QuizSetupState): StartQuizAttemptInput {
  return {
    mode: state.mode,
    ...(state.mode === 'topic' && state.topicId !== 'none' ? { topicId: state.topicId } : {}),
    ...(state.difficulty !== 'all' ? { difficulty: state.difficulty } : {}),
    selection: state.questionSelection,
    ...(state.questionLimit !== 'all' ? { limit: state.questionLimit } : {}),
  };
}

export function buildQuizAttemptHref(attemptId: string, state: QuizSetupState): string {
  const params = new URLSearchParams();

  params.set('attemptId', attemptId);
  params.set('mode', state.mode);
  params.set('limit', String(state.questionLimit));
  params.set('selection', state.questionSelection);

  if (state.mode === 'topic' && state.topicId !== 'none') {
    params.set('topicId', state.topicId);
  }

  if (state.difficulty !== 'all') {
    params.set('difficulty', state.difficulty);
  }

  return `/quizzes/session?${params.toString()}`;
}

export function buildQuizSessionHref(state: QuizSetupState): string {
  return buildQuizAttemptHref('pending', state);
}

export function buildQuizSetupHref(state: QuizSetupState): string {
  const params = new URLSearchParams();

  params.set('mode', state.mode);
  params.set('selection', state.questionSelection);

  if (state.mode === 'topic' && state.topicId !== 'none') {
    params.set('topicId', state.topicId);
  }

  if (state.difficulty !== 'all') {
    params.set('difficulty', state.difficulty);
  }

  params.set('limit', String(state.questionLimit));

  return `/quizzes?${params.toString()}`;
}