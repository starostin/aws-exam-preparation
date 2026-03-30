'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Timer, Trophy } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import {
  completeMockExamAttempt,
  fetchMockExamAttempt,
  fetchMockExamQuestions,
  submitMockExamAnswer,
  type CompleteMockExamAttemptResponse,
  type MockExamAttemptProgressResponse,
  type MockExamAttemptQuestionItem,
} from '@/lib/api/mock-exams';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatRemaining(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function MockExamSessionPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const attemptId = searchParams.get('attemptId');

  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<MockExamAttemptProgressResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MockExamAttemptQuestionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [result, setResult] = useState<CompleteMockExamAttemptResponse | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      if (!attemptId) {
        setError('Missing attempt id. Start a mock exam first.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');

        const attemptProgress = await fetchMockExamAttempt(accessToken, attemptId);
        if (!isMounted) return;

        setToken(accessToken);
        setAttempt(attemptProgress);

        if (attemptProgress.status === 'completed') {
          const completion = await completeMockExamAttempt(accessToken, attemptId);
          if (!isMounted) return;
          setResult(completion);
        }
      } catch (initError) {
        if (!isMounted) return;
        setError(initError instanceof Error ? initError.message : 'Failed to load attempt.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => { isMounted = false; };
  }, [attemptId, supabase]);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestion(): Promise<void> {
      if (!attemptId || !token || !attempt) return;
      setError(null);
      try {
        const page = await fetchMockExamQuestions(token, attemptId, currentPage, 1);
        if (!isMounted) return;

        const question = page.items[0] ?? null;
        setCurrentQuestion(question);
        setSelectedOptionId(question?.selectedOptionId ?? null);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load question.');
      }
    }

    void loadQuestion();
    return () => { isMounted = false; };
  }, [attempt, attemptId, currentPage, token]);

  useEffect(() => {
    if (!attempt) return;

    const deadline = new Date(attempt.startedAt).getTime() + attempt.durationMinutes * 60 * 1000;

    const update = (): void => {
      const now = Date.now();
      const delta = Math.floor((deadline - now) / 1000);
      setRemainingSeconds(delta);
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [attempt]);

  async function persistCurrentAnswer(): Promise<boolean> {
    if (!token || !attemptId || !currentQuestion) {
      return false;
    }

    if (!selectedOptionId) {
      setError('Select an answer before moving to another question or finishing the exam.');
      return false;
    }

    if (currentQuestion.selectedOptionId === selectedOptionId) {
      return true;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitMockExamAnswer(token, attemptId, {
        questionId: currentQuestion.question.id,
        selectedOptionId,
      });

      setCurrentQuestion((value) => (value
        ? {
            ...value,
            selectedOptionId,
            answeredAt: new Date().toISOString(),
          }
        : value));

      const refreshedAttempt = await fetchMockExamAttempt(token, attemptId);
      setAttempt(refreshedAttempt);
      return true;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit answer.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNavigate(nextPage: number): Promise<void> {
    if (!currentQuestion) return;

    const wasSaved = await persistCurrentAnswer();
    if (!wasSaved) return;

    setCurrentPage(nextPage);
  }

  async function handleCompleteAttempt(): Promise<void> {
    if (!token || !attemptId) return;

    const wasSaved = await persistCurrentAnswer();
    if (!wasSaved) return;

    setIsCompleting(true);
    setError(null);
    try {
      const completion = await completeMockExamAttempt(token, attemptId);
      setResult(completion);

      const refreshedAttempt = await fetchMockExamAttempt(token, attemptId);
      setAttempt(refreshedAttempt);
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : 'Failed to complete mock exam.');
    } finally {
      setIsCompleting(false);
    }
  }

  const totalQuestions = attempt?.totalQuestions ?? 0;
  const incorrectReviewItems = result?.reviewItems.filter((item) => !item.isCorrect) ?? [];

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading mock exam session...</p>;
  }

  if (!attempt || !attemptId) {
    return (
      <div className='space-y-4'>
        <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
          {error ?? 'Attempt not found.'}
        </p>
        <Button asChild variant='outline'>
          <Link href='/mock-exams'>Back to Mock Exams</Link>
        </Button>
      </div>
    );
  }

  if (result) {
    return (
      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-amber-500' />
            Exam Complete
          </CardTitle>
          <CardDescription>{attempt.title}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <p>Score: <span className='font-semibold'>{result.score}%</span></p>
          <p>Correct Answers: <span className='font-semibold'>{result.correctAnswers}</span> / {result.totalQuestions}</p>
          <p>Incorrect Answers: <span className='font-semibold'>{incorrectReviewItems.length}</span></p>

          {incorrectReviewItems.length > 0 ? (
            <div className='space-y-4'>
              <p className='text-sm font-semibold text-foreground'>Review Incorrect Answers</p>
              {incorrectReviewItems.map((item) => (
                <div key={item.questionId} className='rounded-lg border border-border/70 bg-background/60 p-4'>
                  <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                    Question {item.questionOrder} • {item.topicTitle} • {item.domainName}
                  </p>
                  <p className='mt-2 font-medium text-foreground'>{item.questionText}</p>
                  <div className='mt-3 space-y-2 text-sm'>
                    <p>
                      Your Answer:{' '}
                      <span className='font-medium text-foreground'>
                        {item.selectedOptionId && item.selectedOptionText
                          ? `${item.selectedOptionId.toUpperCase()}. ${item.selectedOptionText}`
                          : 'No answer recorded'}
                      </span>
                    </p>
                    <p>
                      Correct Answer:{' '}
                      <span className='font-medium text-emerald-700 dark:text-emerald-300'>
                        {item.correctOptionId.toUpperCase()}. {item.correctOptionText}
                      </span>
                    </p>
                    <p className='text-muted-foreground'>{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300'>
              All answers were correct.
            </p>
          )}

          <div className='flex gap-3'>
            <Button asChild variant='outline'>
              <Link href='/mock-exams'>Back to Mock Exams</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-300'>
          <Timer className='mr-1 h-3.5 w-3.5' />
          Timed Mock Exam
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>{attempt.title}</h2>
        <p className='text-sm text-muted-foreground'>
          Question {currentPage} of {totalQuestions}. Your answer is saved when you move between questions.
        </p>
      </div>

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle className='text-base'>Session Status</CardTitle>
          <CardDescription>
            {attempt.answeredQuestions} answered of {attempt.totalQuestions}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-between gap-3 text-sm'>
          <p>Status: <span className='font-medium'>{attempt.status.replace('_', ' ')}</span></p>
          <p className={remainingSeconds != null && remainingSeconds <= 0 ? 'text-rose-500' : 'text-foreground'}>
            Time Left: {remainingSeconds != null ? formatRemaining(remainingSeconds) : '--:--'}
          </p>
        </CardContent>
      </Card>

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      {currentQuestion && (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardDescription>
              {currentQuestion.question.topicTitle} • {currentQuestion.question.difficulty}
            </CardDescription>
            <CardTitle className='text-lg'>{currentQuestion.question.text}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>Select one answer to continue.</p>
            <div className='space-y-2'>
              {currentQuestion.question.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type='button'
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-500/10 text-foreground'
                        : 'border-border/70 bg-background/60 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }`}
                    onClick={() => { setSelectedOptionId(option.id); }}
                    disabled={isSubmitting || isCompleting}
                  >
                    {option.id.toUpperCase()}. {option.text}
                  </button>
                );
              })}
            </div>

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                disabled={currentPage <= 1 || isSubmitting || isCompleting}
                onClick={() => { void handleNavigate(Math.max(1, currentPage - 1)); }}
              >
                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                Previous
              </Button>
              {currentPage < totalQuestions ? (
                <Button
                  type='button'
                  className='bg-amber-500 text-white hover:bg-amber-400'
                  disabled={isSubmitting || isCompleting}
                  onClick={() => { void handleNavigate(Math.min(totalQuestions, currentPage + 1)); }}
                >
                  {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Next Question
                </Button>
              ) : (
                <Button
                  type='button'
                  className='bg-emerald-500 text-white hover:bg-emerald-400'
                  disabled={isCompleting}
                  onClick={() => { void handleCompleteAttempt(); }}
                >
                  {isCompleting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Finish Exam
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
