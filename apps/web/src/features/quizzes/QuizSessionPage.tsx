'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleX, HelpCircle, Loader2, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  completeQuizAttempt,
  fetchQuizAttempt,
  fetchQuizAttemptQuestions,
  submitQuizAnswer,
} from '@/lib/api/quizzes';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildQuizSetupHref,
  parseQuizAttemptId,
  parseQuizSetupState,
  type QuizSetupState,
} from './quiz-session';
import type {
  CompleteQuizAttemptResponse,
  QuizAttemptProgressResponse,
  QuizAttemptQuestionItem,
  SubmitQuizAnswerResponse,
} from '@aws-exam-prep/types';

function findFirstUnansweredIndex(items: QuizAttemptQuestionItem[]): number {
  return items.findIndex((item) => item.answeredAt == null);
}

async function fetchAllAttemptQuestions(token: string, attemptId: string): Promise<QuizAttemptQuestionItem[]> {
  const pageSize = 500;
  let page = 1;
  let totalQuestions = 0;
  const items: QuizAttemptQuestionItem[] = [];

  do {
    const response = await fetchQuizAttemptQuestions(token, attemptId, page, pageSize);
    totalQuestions = response.totalQuestions;
    items.push(...response.items);
    page += 1;
  } while (items.length < totalQuestions && totalQuestions > 0);

  return items;
}

export function QuizSessionPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const setupState = parseQuizSetupState(searchParams);
  const attemptId = parseQuizAttemptId(searchParams);
  const setupHref = buildQuizSetupHref(setupState) as Route;

  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptProgressResponse | null>(null);
  const [questions, setQuestions] = useState<QuizAttemptQuestionItem[]>([]);
  const [completion, setCompletion] = useState<CompleteQuizAttemptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SubmitQuizAnswerResponse | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const quizFinished = completion != null || attempt?.status === 'completed';

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      setIsLoading(true);
      setError(null);

      if (!attemptId) {
        setError('Quiz attempt is missing. Start a quiz from the setup page.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');

        const attemptProgress = await fetchQuizAttempt(accessToken, attemptId);
        const questionItems = await fetchAllAttemptQuestions(accessToken, attemptId);

        if (!isMounted) return;

        setToken(accessToken);
        setAttempt(attemptProgress);
        setQuestions(questionItems);
        setSelectedOptionId(null);
        setFeedback(null);

        if (attemptProgress.status === 'completed') {
          setCompletion({
            attemptId: attemptProgress.attemptId,
            status: 'completed',
            totalQuestions: attemptProgress.totalQuestions,
            answeredQuestions: attemptProgress.answeredQuestions,
            correctAnswers: attemptProgress.correctAnswers,
            accuracy: attemptProgress.accuracy ?? 0,
            completedAt: attemptProgress.completedAt ?? new Date().toISOString(),
          });
          return;
        }

        if (attemptProgress.answeredQuestions === attemptProgress.totalQuestions && attemptProgress.totalQuestions > 0) {
          const completedAttempt = await completeQuizAttempt(accessToken, attemptId);
          if (!isMounted) return;
          setAttempt((previous) => previous ? { ...previous, status: 'completed', completedAt: completedAttempt.completedAt } : previous);
          setCompletion(completedAttempt);
          return;
        }

        const firstUnansweredIndex = findFirstUnansweredIndex(questionItems);
        setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
      } catch (initError) {
        if (!isMounted) return;
        setError(initError instanceof Error ? initError.message : 'Failed to load quiz attempt.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, [attemptId, supabase]);

  async function handleSubmitAnswer(): Promise<void> {
    if (!token || !attemptId || !currentQuestion || !selectedOptionId || feedback) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitQuizAnswer(token, attemptId, {
        questionId: currentQuestion.question.id,
        selectedOptionId,
      });

      setQuestions((previous) => previous.map((item) => (
        item.attemptQuestionId === currentQuestion.attemptQuestionId
          ? {
              ...item,
              selectedOptionId: result.selectedOptionId,
              answeredAt: result.answeredAt,
            }
          : item
      )));
      setAttempt((previous) => previous ? {
        ...previous,
        answeredQuestions: previous.answeredQuestions + 1,
        correctAnswers: previous.correctAnswers + (result.isCorrect ? 1 : 0),
        accuracy: (previous.answeredQuestions + 1) > 0
          ? (previous.correctAnswers + (result.isCorrect ? 1 : 0)) / (previous.answeredQuestions + 1)
          : null,
      } : previous);
      setFeedback(result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNext(): Promise<void> {
    if (!token || !attemptId || !feedback) return;

    const nextIndex = questions.findIndex((item, index) => index > currentIndex && item.answeredAt == null);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
      setSelectedOptionId(null);
      setFeedback(null);
      return;
    }

    setIsCompleting(true);
    setError(null);

    try {
      const completedAttempt = await completeQuizAttempt(token, attemptId);
      setAttempt((previous) => previous ? {
        ...previous,
        status: 'completed',
        completedAt: completedAttempt.completedAt,
        accuracy: completedAttempt.accuracy,
      } : previous);
      setCompletion(completedAttempt);
      setFeedback(null);
      setSelectedOptionId(null);
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : 'Failed to complete quiz.');
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading quiz...</p>;
  }

  if (error && !currentQuestion && !quizFinished) {
    return (
      <div className='flex flex-col gap-4'>
        <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>
        <Button asChild variant='outline' className='w-fit'>
          <Link href={setupHref}>Back to Quiz Setup</Link>
        </Button>
      </div>
    );
  }

  const summary = completion ?? (attempt?.status === 'completed' && attempt?.completedAt
    ? {
        attemptId: attempt.attemptId,
        status: 'completed' as const,
        totalQuestions: attempt.totalQuestions,
        answeredQuestions: attempt.answeredQuestions,
        correctAnswers: attempt.correctAnswers,
        accuracy: attempt.accuracy ?? 0,
        completedAt: attempt.completedAt,
      }
    : null);

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>
          <HelpCircle className='mr-1 h-3.5 w-3.5' />
          Practice Quizzes
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>Quiz Session</h2>
        <p className='text-sm text-muted-foreground'>
          Your progress is saved after every answer, so you can stop and continue from the next unfinished question later.
        </p>
      </div>

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      {!quizFinished && currentQuestion && attempt ? (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardDescription>
              Question {currentQuestion.questionOrder} of {attempt.totalQuestions}
              {' '}
              •
              {' '}
              {attempt.answeredQuestions} answered
            </CardDescription>
            <CardTitle className='text-lg'>{currentQuestion.question.text}</CardTitle>
            <p className='text-xs text-muted-foreground'>
              {currentQuestion.question.topicTitle} • {currentQuestion.question.difficulty}
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              {currentQuestion.question.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type='button'
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? 'border-violet-500/60 bg-violet-500/10 text-foreground'
                        : 'border-border/70 bg-background/60 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }`}
                    onClick={() => { setSelectedOptionId(option.id); }}
                    disabled={!!feedback}
                  >
                    {option.id.toUpperCase()}. {option.text}
                  </button>
                );
              })}
            </div>

            {!feedback ? (
              <div className='flex justify-end'>
                <Button
                  type='button'
                  onClick={() => { void handleSubmitAnswer(); }}
                  disabled={!selectedOptionId || isSubmitting}
                  className='bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                >
                  {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className='space-y-3 rounded-lg border border-border/70 bg-background/50 p-4'>
                <p className={`flex items-center gap-2 text-sm font-medium ${feedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {feedback.isCorrect ? <CheckCircle2 className='h-4 w-4' /> : <CircleX className='h-4 w-4' />}
                  {feedback.isCorrect ? 'Correct answer' : `Incorrect. Correct option: ${feedback.correctOptionId.toUpperCase()}`}
                </p>
                <p className='text-sm text-muted-foreground'>{feedback.explanation}</p>
                <Button
                  type='button'
                  onClick={() => { void handleNext(); }}
                  disabled={isCompleting}
                  className='bg-violet-500 text-white hover:bg-violet-400'
                >
                  {isCompleting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  {attempt.answeredQuestions >= attempt.totalQuestions ? 'Finish Quiz' : 'Next Unfinished Question'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {summary ? (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-amber-500' />
              Quiz Complete
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p className='text-foreground'>
              You answered <span className='font-semibold'>{summary.correctAnswers}</span> out of{' '}
              <span className='font-semibold'>{summary.answeredQuestions}</span> correctly.
            </p>
            <p className='text-muted-foreground'>
              Session accuracy: {Math.round(summary.accuracy * 100)}%
            </p>
            <div className='flex flex-wrap gap-3'>
              <Button asChild variant='outline'>
                <Link href={setupHref}>Configure New Quiz</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}