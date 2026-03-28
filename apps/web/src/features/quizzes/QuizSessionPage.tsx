'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleX, HelpCircle, Loader2, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchQuizQuestions, submitQuizAttempt } from '@/lib/api/quizzes';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildQuizSessionHref, buildQuizSetupHref, parseQuizSetupState } from './quiz-session';
import type { ListQuizQuestionsInput, QuizQuestionItem, SubmitQuizAttemptResponse } from '@aws-exam-prep/types';

export function QuizSessionPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const setupState = parseQuizSetupState(searchParams);
  const setupHref = buildQuizSetupHref(setupState) as Route;
  const retryHref = buildQuizSessionHref(setupState) as Route;

  const [token, setToken] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SubmitQuizAttemptResponse | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      setIsLoading(true);
      setError(null);

      if (setupState.mode === 'topic' && setupState.topicId === 'none') {
        setError('Please choose a topic before starting a topic quiz.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');

        const input: ListQuizQuestionsInput = {
          mode: setupState.mode,
          limit: setupState.questionLimit,
          ...(setupState.mode === 'topic' && setupState.topicId !== 'none' ? { topicId: setupState.topicId } : {}),
          ...(setupState.difficulty !== 'all' ? { difficulty: setupState.difficulty } : {}),
        };

        const questionSet = await fetchQuizQuestions(accessToken, input);
        if (!isMounted) return;

        if (questionSet.length === 0) {
          setError('No questions found for your current filters. Try a different difficulty or mode.');
          setQuestions([]);
          return;
        }

        setToken(accessToken);
        setQuestions(questionSet);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setFeedback(null);
        setCorrectCount(0);
        setAnsweredCount(0);
        setQuizFinished(false);
      } catch (initError) {
        if (!isMounted) return;
        setError(initError instanceof Error ? initError.message : 'Failed to start quiz.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, [setupState.difficulty, setupState.mode, setupState.questionLimit, setupState.topicId, supabase]);

  async function handleSubmitAnswer(): Promise<void> {
    if (!token || !currentQuestion || !selectedOptionId || feedback) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitQuizAttempt(token, {
        questionId: currentQuestion.id,
        selectedOptionId,
      });
      setFeedback(result);
      setAnsweredCount((count) => count + 1);
      if (result.isCorrect) {
        setCorrectCount((count) => count + 1);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext(): void {
    if (!feedback) return;

    const isLastQuestion = currentIndex >= questions.length - 1;
    if (isLastQuestion) {
      setQuizFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedOptionId(null);
    setFeedback(null);
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

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>
          <HelpCircle className='mr-1 h-3.5 w-3.5' />
          Practice Quizzes
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>Quiz Session</h2>
        <p className='text-sm text-muted-foreground'>
          Focus on one question at a time, submit your answer, and review the explanation before moving on.
        </p>
      </div>

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      {!quizFinished && currentQuestion ? (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardDescription>
              Question {currentIndex + 1} of {questions.length}
            </CardDescription>
            <CardTitle className='text-lg'>{currentQuestion.text}</CardTitle>
            <p className='text-xs text-muted-foreground'>
              {currentQuestion.topicTitle} • {currentQuestion.difficulty}
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              {currentQuestion.options.map((option) => {
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
                  onClick={handleNext}
                  className='bg-violet-500 text-white hover:bg-violet-400'
                >
                  {currentIndex >= questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {quizFinished && (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-amber-500' />
              Quiz Complete
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p className='text-foreground'>
              You answered <span className='font-semibold'>{correctCount}</span> out of{' '}
              <span className='font-semibold'>{answeredCount}</span> correctly.
            </p>
            <p className='text-muted-foreground'>
              Session accuracy: {answeredCount > 0 ? `${Math.round((correctCount / answeredCount) * 100)}%` : 'N/A'}
            </p>
            <div className='flex flex-wrap gap-3'>
              <Button asChild variant='outline'>
                <Link href={setupHref}>Configure New Quiz</Link>
              </Button>
              <Button asChild className='bg-violet-500 text-white hover:bg-violet-400'>
                <Link href={retryHref}>Retry Quiz</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}