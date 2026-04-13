'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock3, Loader2, Play, Target, Trophy, XCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import {
  fetchMockExamAttemptHistory,
  fetchMockExams,
  fetchMockExamStats,
  resetMockExamStats,
  startMockExamAttempt,
} from '@/lib/api/mock-exams';
import type { MockExamAttemptHistoryItem, MockExamStatsResponse, MockExamSummary } from '@aws-exam-prep/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatDateTime(value: string | null): string {
  if (!value) return 'In progress';
  return new Date(value).toLocaleString();
}

export function MockExamsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [token, setToken] = useState<string | null>(null);
  const [exams, setExams] = useState<MockExamSummary[]>([]);
  const [history, setHistory] = useState<MockExamAttemptHistoryItem[]>([]);
  const [stats, setStats] = useState<MockExamStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [openingAttemptId, setOpeningAttemptId] = useState<string | null>(null);
  const [isResettingStats, setIsResettingStats] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData(): Promise<void> {
      setIsLoading(true);
      setError(null);
      setResetMessage(null);
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');
        if (!isMounted) return;

        setToken(accessToken);

        const [examRows, historyRows, statsResponse] = await Promise.all([
          fetchMockExams(accessToken),
          fetchMockExamAttemptHistory(accessToken),
          fetchMockExamStats(accessToken),
        ]);

        if (!isMounted) return;
        setExams(examRows);
        setHistory(historyRows);
        setStats(statsResponse);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load mock exams.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => { isMounted = false; };
  }, [supabase]);

  async function handleStartExam(mockExamId: string): Promise<void> {
    if (!token) return;

    setStartingExamId(mockExamId);
    setError(null);
    try {
      const attempt = await startMockExamAttempt(token, mockExamId);
      router.push(`/mock-exams/session?attemptId=${attempt.attemptId}`);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Failed to start mock exam.');
    } finally {
      setStartingExamId(null);
    }
  }

  function handleResumeAttempt(attemptId: string): void {
    setOpeningAttemptId(attemptId);
    setError(null);
    router.push(`/mock-exams/session?attemptId=${attemptId}`);
  }

  async function handleResetMockExamStats(): Promise<void> {
    if (!token) return;
    if (!window.confirm('Are you sure you want to reset all mock exam stats and history? This cannot be undone.')) {
      return;
    }

    setIsResettingStats(true);
    setResetMessage(null);
    setError(null);

    try {
      const response = await resetMockExamStats(token);
      const [historyRows, statsResponse] = await Promise.all([
        fetchMockExamAttemptHistory(token),
        fetchMockExamStats(token),
      ]);
      setHistory(historyRows);
      setStats(statsResponse);
      setResetMessage(response.message);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset mock exam stats.');
    } finally {
      setIsResettingStats(false);
    }
  }

  const activeAttempts = useMemo(
    () => history.filter((attempt) => attempt.status === 'in_progress'),
    [history],
  );

  const completedAttempts = useMemo(
    () => history.filter((attempt) => attempt.status === 'completed'),
    [history],
  );

  const statsOverview = useMemo(() => {
    const averageScore = stats?.averageScore != null ? Math.round(stats.averageScore) : 0;
    const bestScore = stats?.bestScore != null ? Math.round(stats.bestScore) : 0;
    const passRate = completedAttempts.length > 0
      ? Math.round((completedAttempts.filter((attempt) => (attempt.score ?? 0) >= 72).length / completedAttempts.length) * 100)
      : 0;

    return {
      totalAttempts: stats?.totalAttempts ?? 0,
      completedAttempts: stats?.completedAttempts ?? 0,
      inProgressAttempts: stats?.inProgressAttempts ?? 0,
      averageScore,
      bestScore,
      passRate,
    };
  }, [completedAttempts, stats]);

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-300'>
          <Trophy className='mr-1 h-3.5 w-3.5' />
          Mock Exams
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>Practice Like The Real Exam</h2>
        <p className='text-sm text-muted-foreground'>
          Start a timed mock exam, move between questions to save answers, and review incorrect responses after you finish.
        </p>
      </div>

      {resetMessage ? (
        <p className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200'>
          {resetMessage}
        </p>
      ) : null}

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      <section className='grid gap-4 lg:grid-cols-12'>
        <Card className='lg:col-span-8 overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card/90 to-cyan-500/10'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <Target className='h-5 w-5 text-amber-400' />
              Mock Exam Snapshot
            </CardTitle>
            <CardDescription>Your progress across all mock exam attempts.</CardDescription>
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200'
                onClick={() => { void handleResetMockExamStats(); }}
                disabled={isResettingStats}
              >
                {isResettingStats ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                {isResettingStats ? 'Resetting...' : 'Reset Mock Exam Stats'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-xl border border-border/70 bg-background/60 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Attempts</p>
              <p className='mt-1 text-2xl font-semibold text-foreground'>{statsOverview.totalAttempts}</p>
              <p className='mt-1 text-xs text-muted-foreground'>Total attempts started</p>
            </div>
            <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Completed
              </p>
              <p className='mt-1 text-2xl font-semibold text-emerald-200'>{statsOverview.completedAttempts}</p>
              <p className='mt-1 text-xs text-emerald-200/80'>Finished exam attempts</p>
            </div>
            <div className='rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300'>
                <Clock3 className='h-3.5 w-3.5' />
                In Progress
              </p>
              <p className='mt-1 text-2xl font-semibold text-cyan-100'>{statsOverview.inProgressAttempts}</p>
              <p className='mt-1 text-xs text-cyan-100/80'>Can be resumed anytime</p>
            </div>
            <div className='rounded-xl border border-rose-500/30 bg-rose-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-300'>
                <XCircle className='h-3.5 w-3.5' />
                Pass Rate
              </p>
              <p className='mt-1 text-2xl font-semibold text-rose-200'>{statsOverview.passRate}%</p>
              <p className='mt-1 text-xs text-rose-200/80'>Completed attempts with 72%+ score</p>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-4 border-border/70 bg-card/70'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Scores</CardTitle>
            <CardDescription>How your results trend over time.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-xl border border-border/70 bg-background/50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Average Score</p>
              <p className='mt-1 text-3xl font-semibold text-foreground'>{statsOverview.averageScore}%</p>
            </div>
            <div className='rounded-xl border border-border/70 bg-background/50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Best Score</p>
              <p className='mt-1 text-3xl font-semibold text-foreground'>{statsOverview.bestScore}%</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {activeAttempts.length > 0 ? (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock3 className='h-5 w-5 text-cyan-500' />
              Resume Unfinished Exam
            </CardTitle>
            <CardDescription>Your in-progress mock exams are saved and ready to continue.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3'>
            {activeAttempts.map((attempt) => (
              <div key={attempt.attemptId} className='flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 md:flex-row md:items-center md:justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-foreground'>{attempt.mockExamTitle}</p>
                  <p className='text-xs text-muted-foreground'>
                    Started {formatDateTime(attempt.startedAt)}
                  </p>
                </div>
                <Button
                  type='button'
                  className='bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  disabled={openingAttemptId === attempt.attemptId}
                  onClick={() => { handleResumeAttempt(attempt.attemptId); }}
                >
                  {openingAttemptId === attempt.attemptId ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Resume
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle>Available Mock Exams</CardTitle>
          <CardDescription>Choose any exam and start a new timed attempt.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? <p className='text-sm text-muted-foreground'>Loading exams...</p> : null}
          {!isLoading && exams.length === 0 ? <p className='text-sm text-muted-foreground'>No exams available yet.</p> : null}

          {exams.map((exam) => (
            <div key={exam.id} className='flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 p-3'>
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-foreground'>{exam.title}</p>
                <p className='text-xs text-muted-foreground'>
                  {exam.totalQuestions} questions • {exam.durationMinutes} minutes • {exam.certificationCode}
                </p>
              </div>
              <Button
                type='button'
                className='bg-amber-500 text-white hover:bg-amber-400'
                disabled={startingExamId === exam.id}
                onClick={() => { void handleStartExam(exam.id); }}
              >
                {startingExamId === exam.id ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Play className='mr-2 h-4 w-4' />}
                Start Exam
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
