'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trophy } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { fetchMockExamAttemptHistory, fetchMockExams, startMockExamAttempt } from '@/lib/api/mock-exams';
import type { MockExamAttemptHistoryItem, MockExamSummary } from '@/lib/api/mock-exams';
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
  const [isLoading, setIsLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [openingAttemptId, setOpeningAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');
        if (!isMounted) return;

        setToken(accessToken);

        const [examRows, historyRows] = await Promise.all([
          fetchMockExams(accessToken),
          fetchMockExamAttemptHistory(accessToken),
        ]);

        if (!isMounted) return;
        setExams(examRows);
        setHistory(historyRows);
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

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle>Available Mock Exams</CardTitle>
          <CardDescription>Choose any exam and start a new attempt.</CardDescription>
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
                {startingExamId === exam.id ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                Start Exam
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
          <CardDescription>Your latest mock exam history.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? <p className='text-sm text-muted-foreground'>Loading history...</p> : null}
          {!isLoading && history.length === 0 ? <p className='text-sm text-muted-foreground'>No attempts yet.</p> : null}

          {history.slice(0, 8).map((attempt) => (
            <div key={attempt.attemptId} className='flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 p-3'>
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-foreground'>{attempt.mockExamTitle}</p>
                <p className='text-xs text-muted-foreground'>
                  Status: {attempt.status.replace('_', ' ')} • Score: {attempt.score != null ? `${attempt.score}%` : 'N/A'}
                </p>
                <p className='text-xs text-muted-foreground'>Completed: {formatDateTime(attempt.completedAt)}</p>
              </div>

              {attempt.status === 'in_progress' ? (
                <Button
                  type='button'
                  variant='outline'
                  disabled={openingAttemptId === attempt.attemptId}
                  onClick={() => { handleResumeAttempt(attempt.attemptId); }}
                >
                  {openingAttemptId === attempt.attemptId ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Continue Exam
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
