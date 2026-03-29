'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { fetchDashboard, resetStudyPlan } from '@/lib/api/study-plans';
import { Button } from '@/components/ui/button';
import { ActiveStudyPlan } from '@/features/study-plans/ActiveStudyPlan';
import { StatsPanel } from './StatsPanel';
import { ProgressCharts } from './ProgressCharts';
import type { DashboardResponse } from '@aws-exam-prep/types';

export function DashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadDashboard = useCallback(
    async (accessToken: string): Promise<void> => {
      const dashboardData = await fetchDashboard(accessToken);
      setDashboard(dashboardData);
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');

        if (isMounted) setToken(accessToken);
        if (isMounted) await loadDashboard(accessToken);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => { isMounted = false; };
  }, [supabase, loadDashboard]);

  async function handleResetStudyPlan(): Promise<void> {
    if (!token) return;
    if (!window.confirm('Are you sure you want to reset your study plan? All progress will be cleared.')) return;
    setIsResetting(true);
    try {
      await resetStudyPlan(token);
      window.dispatchEvent(new Event('study-plan-reset'));
      setDashboard(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset study plan');
    } finally {
      setIsResetting(false);
    }
  }

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading dashboard...</p>;
  }

  if (error) {
    return <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>;
  }

  // No study plan — show placeholder
  if (!dashboard?.studyPlan) {
    return (
      <section className='mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-16 text-center animate-rise-in'>
        <div className='flex h-20 w-20 items-center justify-center rounded-2xl border border-border/70 bg-card/80 text-4xl'>
          📋
        </div>
        <div className='space-y-3'>
          <h2 className='text-3xl font-semibold text-foreground'>No Study Plan Yet</h2>
          <p className='text-muted-foreground'>
            You haven&apos;t set up a study plan yet. Create one to start tracking your daily progress, tasks, and readiness score right here on the dashboard.
          </p>
        </div>
        <Button asChild size='lg' className='gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400'>
          <Link href='/study-plans'>
            <ClipboardList className='h-5 w-5' />
            Set Up Study Plan
          </Link>
        </Button>
      </section>
    );
  }

  const { studyPlan, stats } = dashboard;

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <ActiveStudyPlan
        studyPlan={studyPlan}
        token={token}
        isResetting={isResetting}
        onReset={() => { void handleResetStudyPlan(); }}
      />

      <section className='space-y-3'>
        <h3 className='text-sm uppercase tracking-[0.15em] text-muted-foreground'>Progress Snapshot</h3>
        <StatsPanel plan={studyPlan} stats={stats} />
      </section>

      <section className='space-y-3'>
        <h3 className='text-sm uppercase tracking-[0.15em] text-muted-foreground'>Progress Charts</h3>
        <ProgressCharts plan={studyPlan} stats={stats} />
      </section>
    </div>
  );
}
