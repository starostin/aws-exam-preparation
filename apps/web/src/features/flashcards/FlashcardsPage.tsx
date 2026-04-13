'use client';

import type { Route } from 'next';
import { BookOpen, CheckCircle2, Clock3, Loader2, Play, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchFlashcardSessionHistory,
  fetchFlashcardStats,
  fetchFlashcardTopics,
  resetFlashcardStats,
  startFlashcardSession,
} from '@/lib/api/flashcards';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FlashcardSessionSummary, FlashcardTopicSummary } from '@aws-exam-prep/types';

const SESSION_LIMIT_OPTIONS = [10, 20, 40, 'all'] as const;

export function FlashcardsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [token, setToken] = useState<string | null>(null);
  const [topics, setTopics] = useState<FlashcardTopicSummary[]>([]);
  const [sessionHistory, setSessionHistory] = useState<FlashcardSessionSummary[]>([]);
  const [stats, setStats] = useState<{
    totalCards: number;
    reviewedCards: number;
    averageConfidence: number | null;
    inProgressSessions: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isResettingStats, setIsResettingStats] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'due_only'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [sessionLimit, setSessionLimit] = useState<number | 'all'>(20);

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
        if (!isMounted) return;

        setToken(accessToken);

        const [topicsData, historyData, statsData] = await Promise.all([
          fetchFlashcardTopics(accessToken),
          fetchFlashcardSessionHistory(accessToken),
          fetchFlashcardStats(accessToken),
        ]);
        if (!isMounted) return;

        setTopics(topicsData);
        setSessionHistory(historyData);
        setStats(statsData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load flashcards.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const activeSessions = useMemo(
    () => sessionHistory.filter((session) => session.status === 'in_progress'),
    [sessionHistory],
  );

  async function handleStartSession(): Promise<void> {
    if (!token) return;

    setIsStartingSession(true);
    setError(null);

    try {
      const sessionInput = {
        ...(topicFilter !== 'all' ? { topicId: topicFilter } : {}),
        filter: sessionFilter,
        ...(sessionLimit === 'all' ? {} : { limit: sessionLimit }),
      };

      const session = await startFlashcardSession(token, sessionInput);

      const [historyData, statsData] = await Promise.all([
        fetchFlashcardSessionHistory(token),
        fetchFlashcardStats(token),
      ]);

      setSessionHistory(historyData);
      setStats(statsData);
      router.push((`/flashcards/review?sessionId=${session.sessionId}`) as Route);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Failed to start flashcard session.');
    } finally {
      setIsStartingSession(false);
    }
  }

  async function handleResetFlashcardStats(): Promise<void> {
    if (!token) return;
    if (!window.confirm('Are you sure you want to reset all flashcard stats and history? This cannot be undone.')) {
      return;
    }

    setIsResettingStats(true);
    setError(null);
    setResetMessage(null);

    try {
      const response = await resetFlashcardStats(token);
      const [historyData, statsData] = await Promise.all([
        fetchFlashcardSessionHistory(token),
        fetchFlashcardStats(token),
      ]);
      setSessionHistory(historyData);
      setStats(statsData);
      setResetMessage(response.message);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset flashcard stats.');
    } finally {
      setIsResettingStats(false);
    }
  }

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading flashcards...</p>;
  }

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-blue-500/15 text-blue-700 dark:text-blue-300'>
          <BookOpen className='mr-1 h-3.5 w-3.5' />
          Flashcards
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>Build Long-Term Recall</h2>
        <p className='text-sm text-muted-foreground'>
          Start focused review sessions, track confidence over time, and continue any unfinished session exactly where you left off.
        </p>
      </div>

      {resetMessage ? (
        <p className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200'>
          {resetMessage}
        </p>
      ) : null}

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      <section className='grid gap-4 lg:grid-cols-12'>
        <Card className='lg:col-span-8 overflow-hidden border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card/90 to-cyan-500/10'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <TrendingUp className='h-5 w-5 text-blue-400' />
              Flashcard Snapshot
            </CardTitle>
            <CardDescription>Your review pace and confidence across all flashcards.</CardDescription>
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200'
                onClick={() => { void handleResetFlashcardStats(); }}
                disabled={isResettingStats}
              >
                {isResettingStats ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                {isResettingStats ? 'Resetting...' : 'Reset Flashcard Stats'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            <div className='rounded-xl border border-border/70 bg-background/60 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Total Cards</p>
              <p className='mt-1 text-2xl font-semibold text-foreground'>{stats?.totalCards ?? 0}</p>
            </div>
            <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Reviewed
              </p>
              <p className='mt-1 text-2xl font-semibold text-emerald-200'>{stats?.reviewedCards ?? 0}</p>
            </div>
            <div className='rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4'>
              <p className='flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300'>
                <Target className='h-3.5 w-3.5' />
                Avg Confidence
              </p>
              <p className='mt-1 text-2xl font-semibold text-cyan-100'>
                {stats?.averageConfidence != null ? `${stats.averageConfidence.toFixed(1)} / 5` : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-4 border-border/70 bg-card/70'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Sessions</CardTitle>
            <CardDescription>Track your current review streak.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-xl border border-border/70 bg-background/50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>In Progress</p>
              <p className='mt-1 text-3xl font-semibold text-foreground'>{stats?.inProgressSessions ?? 0}</p>
            </div>
            <div className='rounded-xl border border-border/70 bg-background/50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Topics</p>
              <p className='mt-1 text-3xl font-semibold text-foreground'>{topics.length}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {activeSessions.length > 0 ? (
        <Card className='border-border/70 bg-card/70'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock3 className='h-5 w-5 text-cyan-500' />
              Resume Unfinished Session
            </CardTitle>
            <CardDescription>Pick up exactly where you left off.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3'>
            {activeSessions.map((session) => (
              <div key={session.sessionId} className='flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 md:flex-row md:items-center md:justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-foreground'>{session.topicTitle ?? 'Mixed flashcards'}</p>
                  <p className='text-xs text-muted-foreground'>
                    {session.reviewedCards} of {session.totalCards} reviewed
                    {' '}
                    •
                    {' '}
                    {session.filter === 'due_only' ? 'due only' : 'all cards'}
                  </p>
                </div>
                <Button
                  type='button'
                  className='bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  onClick={() => {
                    router.push((`/flashcards/review?sessionId=${session.sessionId}`) as Route);
                  }}
                >
                  Resume
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle>Session Setup</CardTitle>
          <CardDescription>Choose filters and session size, then start your flashcard run.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Topic</p>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='All topics' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.topicId} value={topic.topicId}>
                    {topic.topicTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Card Set</p>
            <Select value={sessionFilter} onValueChange={(value) => setSessionFilter(value as 'all' | 'due_only')}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='All cards' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All cards</SelectItem>
                <SelectItem value='due_only'>Due only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Cards</p>
            <Select value={String(sessionLimit)} onValueChange={(value) => setSessionLimit(value === 'all' ? 'all' : Number(value))}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='20 cards' />
              </SelectTrigger>
              <SelectContent>
                {SESSION_LIMIT_OPTIONS.map((value) => (
                  <SelectItem key={String(value)} value={String(value)}>
                    {value === 'all' ? 'All matching cards' : `${value} cards`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-end justify-end'>
            <Button
              type='button'
              className='bg-blue-500 text-white hover:bg-blue-400'
              onClick={() => { void handleStartSession(); }}
              disabled={isStartingSession}
            >
              {isStartingSession ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Play className='mr-2 h-4 w-4' />}
              Start Session
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
