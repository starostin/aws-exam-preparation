'use client';

import type { Route } from 'next';
import { CheckCircle2, Clock3, HelpCircle, Loader2, Play, Target, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchQuizAttemptHistory,
  fetchQuizStats,
  fetchQuizTopics,
  resetQuizStats,
  startQuizAttempt,
} from '@/lib/api/quizzes';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  buildQuizAttemptHref,
  buildStartQuizAttemptInput,
  DIFFICULTY_OPTIONS,
  LIMIT_OPTIONS,
  parseQuizSetupState,
  QUESTION_SELECTION_OPTIONS,
  type QuizSetupState,
} from './quiz-session';
import type {
  QuestionDifficulty,
  QuizAttemptSummary,
  QuizMode,
  QuizStatsResponse,
  QuizTopicSummary,
} from '@aws-exam-prep/types';

function toSetupState(attempt: QuizAttemptSummary): QuizSetupState {
  return {
    mode: attempt.mode,
    topicId: attempt.topicId ?? 'none',
    difficulty: attempt.difficulty ?? 'all',
    questionSelection: attempt.questionSelection,
    questionLimit: attempt.totalQuestions,
  };
}

export function QuizzesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const setupState = parseQuizSetupState(searchParams);

  const [topics, setTopics] = useState<QuizTopicSummary[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [stats, setStats] = useState<QuizStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [isResettingStats, setIsResettingStats] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<QuizMode>(setupState.mode);
  const [topicId, setTopicId] = useState<string>(setupState.topicId);
  const [difficulty, setDifficulty] = useState<'all' | QuestionDifficulty>(setupState.difficulty);
  const [questionSelection, setQuestionSelection] = useState<'all' | 'unanswered'>(setupState.questionSelection);
  const [questionLimit, setQuestionLimit] = useState<number | 'all'>(setupState.questionLimit);

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      setIsLoading(true);
      setError(null);
      setResetMessage(null);

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');

        const [topicsData, attemptHistory, statsData] = await Promise.all([
          fetchQuizTopics(accessToken),
          fetchQuizAttemptHistory(accessToken),
          fetchQuizStats(accessToken),
        ]);

        if (!isMounted) return;

        setTopics(topicsData);
        setAttempts(attemptHistory);
        setStats(statsData);
        setMode(setupState.mode);
        setDifficulty(setupState.difficulty);
        setQuestionSelection(setupState.questionSelection);
        setQuestionLimit(setupState.questionLimit);
        if (setupState.mode === 'topic' && topicsData.some((topic) => topic.topicId === setupState.topicId)) {
          setTopicId(setupState.topicId);
        } else {
          setTopicId('none');
        }
      } catch (initError) {
        if (!isMounted) return;
        setError(initError instanceof Error ? initError.message : 'Failed to load quizzes.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, [setupState.difficulty, setupState.mode, setupState.questionLimit, setupState.questionSelection, setupState.topicId, supabase]);

  const activeAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.status === 'in_progress'),
    [attempts],
  );

  const statsOverview = useMemo(() => {
    if (!stats) {
      return {
        answered: 0,
        correct: 0,
        incorrect: 0,
        accuracyPct: 0,
        practicedTopics: 0,
        masteredTopics: 0,
      };
    }

    const answered = stats.totalAttempts;
    const correct = stats.correctAttempts;
    const incorrect = Math.max(0, answered - correct);
    const accuracyPct = stats.accuracy == null ? 0 : Math.round(stats.accuracy * 100);
    const practicedTopics = stats.byTopic.length;
    const masteredTopics = stats.byTopic.filter((topic) => topic.attempts >= 5 && topic.accuracy >= 0.8).length;

    return {
      answered,
      correct,
      incorrect,
      accuracyPct,
      practicedTopics,
      masteredTopics,
    };
  }, [stats]);

  async function handleStartQuiz(): Promise<void> {
    if (mode === 'topic' && topicId === 'none') {
      setError('Please select a topic before starting a topic quiz.');
      return;
    }

    setIsStartingQuiz(true);
    setError(null);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);

      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated. Please sign in.');

      const state: QuizSetupState = {
        mode,
        topicId,
        difficulty,
        questionSelection,
        questionLimit,
      };

      const attempt = await startQuizAttempt(accessToken, buildStartQuizAttemptInput(state));
      router.push(buildQuizAttemptHref(attempt.attemptId, state) as Route);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Failed to start quiz.');
    } finally {
      setIsStartingQuiz(false);
    }
  }

  async function handleResetQuizStats(): Promise<void> {
    if (!window.confirm('Are you sure you want to reset all quiz stats and history? This cannot be undone.')) {
      return;
    }

    setIsResettingStats(true);
    setError(null);
    setResetMessage(null);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);

      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated. Please sign in.');

      const response = await resetQuizStats(accessToken);
      const [attemptHistory, statsData] = await Promise.all([
        fetchQuizAttemptHistory(accessToken),
        fetchQuizStats(accessToken),
      ]);

      setAttempts(attemptHistory);
      setStats(statsData);
      setResetMessage(response.message);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset quiz stats.');
    } finally {
      setIsResettingStats(false);
    }
  }

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading quizzes...</p>;
  }

  if (error && topics.length === 0) {
    return <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>;
  }

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>
          <HelpCircle className='mr-1 h-3.5 w-3.5' />
          Practice Quizzes
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>Sharpen Your AWS Decision Skills</h2>
        <p className='text-sm text-muted-foreground'>
          Start a fresh quiz, focus only on unanswered questions, or resume an unfinished run whenever you come back.
        </p>
      </div>

      {resetMessage ? (
        <p className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200'>
          {resetMessage}
        </p>
      ) : null}

      <section className='grid gap-4 lg:grid-cols-12'>
        <Card className='lg:col-span-8 overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card/90 to-cyan-500/10'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <TrendingUp className='h-5 w-5 text-emerald-400' />
              Quiz Performance Snapshot
            </CardTitle>
            <CardDescription>Your cumulative quiz performance across all attempts.</CardDescription>
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200'
                onClick={() => { void handleResetQuizStats(); }}
                disabled={isResettingStats}
              >
                {isResettingStats ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                {isResettingStats ? 'Resetting...' : 'Reset Quiz Stats'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-xl border border-border/70 bg-background/60 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Answered</p>
              <p className='mt-1 text-2xl font-semibold text-foreground'>{statsOverview.answered}</p>
              <p className='mt-1 text-xs text-muted-foreground'>Total questions you attempted</p>
            </div>
            <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Correct
              </p>
              <p className='mt-1 text-2xl font-semibold text-emerald-200'>{statsOverview.correct}</p>
              <p className='mt-1 text-xs text-emerald-200/80'>Right answers so far</p>
            </div>
            <div className='rounded-xl border border-rose-500/30 bg-rose-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-300'>
                <XCircle className='h-3.5 w-3.5' />
                Incorrect
              </p>
              <p className='mt-1 text-2xl font-semibold text-rose-200'>{statsOverview.incorrect}</p>
              <p className='mt-1 text-xs text-rose-200/80'>Answers to revisit</p>
            </div>
            <div className='rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300'>
                <Target className='h-3.5 w-3.5' />
                Accuracy
              </p>
              <p className='mt-1 text-2xl font-semibold text-cyan-100'>{statsOverview.accuracyPct}%</p>
              <p className='mt-1 text-xs text-cyan-100/80'>Overall success rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-4 border-border/70 bg-card/70'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Coverage</CardTitle>
            <CardDescription>How broadly you have practiced topics.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-xl border border-border/70 bg-background/50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Topics Practiced</p>
              <p className='mt-1 text-3xl font-semibold text-foreground'>{statsOverview.practicedTopics}</p>
            </div>
            <div className='rounded-xl border border-border/70 bg-background/50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Mastered Topics</p>
              <p className='mt-1 text-3xl font-semibold text-foreground'>{statsOverview.masteredTopics}</p>
              <p className='mt-1 text-xs text-muted-foreground'>At least 5 attempts and 80%+ accuracy</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {activeAttempts.length > 0 ? (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock3 className='h-5 w-5 text-cyan-500' />
              Resume Unfinished Quiz
            </CardTitle>
            <CardDescription>Your last in-progress quiz attempts stay available until you finish them.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3'>
            {activeAttempts.map((attempt) => {
              const resumeState = toSetupState(attempt);
              const resumeHref = buildQuizAttemptHref(attempt.attemptId, resumeState) as Route;

              return (
                <div key={attempt.attemptId} className='flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 md:flex-row md:items-center md:justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-foreground'>
                      {attempt.mode === 'topic' ? (attempt.topicTitle ?? 'Topic quiz') : 'Mixed quiz'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {attempt.answeredQuestions} of {attempt.totalQuestions} answered
                      {' '}
                      •
                      {' '}
                      {attempt.questionSelection === 'unanswered' ? 'unanswered only' : 'all questions'}
                    </p>
                  </div>
                  <Button asChild className='bg-cyan-500 text-slate-950 hover:bg-cyan-400'>
                    <a href={resumeHref}>Resume</a>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle>Quiz Setup</CardTitle>
          <CardDescription>Choose mode, filters, and how many questions you want to carry in this attempt.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Mode</p>
            <Select value={mode} onValueChange={(value) => setMode(value as QuizMode)}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='Choose mode' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='topic'>Topic Quiz</SelectItem>
                <SelectItem value='mixed'>Mixed Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Topic</p>
            <Select value={topicId} onValueChange={setTopicId} disabled={mode === 'mixed'}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='Select topic' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Select topic</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.topicId} value={topic.topicId}>
                    {topic.topicTitle} ({topic.questionCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Question Set</p>
            <Select value={questionSelection} onValueChange={(value) => setQuestionSelection(value as 'all' | 'unanswered')}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='Choose question set' />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_SELECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Difficulty</p>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'all' | QuestionDifficulty)}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='All difficulties' />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Questions</p>
            <Select value={String(questionLimit)} onValueChange={(value) => setQuestionLimit(value === 'all' ? 'all' : Number(value))}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='10' />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((value) => (
                  <SelectItem key={String(value)} value={String(value)}>
                    {value === 'all' ? 'All matching questions' : `${value} questions`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end xl:col-span-5'>
            <Button
              type='button'
              className='bg-violet-500 text-white hover:bg-violet-400'
              onClick={() => { void handleStartQuiz(); }}
              disabled={isStartingQuiz || (mode === 'topic' && topicId === 'none')}
            >
              {isStartingQuiz ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Play className='mr-2 h-4 w-4' />}
              Start Quiz
            </Button>
          </div>

          {error ? (
            <div className='xl:col-span-5'>
              <p className='text-sm text-destructive'>{error}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}