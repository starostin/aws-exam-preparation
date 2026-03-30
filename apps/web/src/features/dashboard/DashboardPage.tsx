'use client';

import Link from 'next/link';
import { CalendarCheck, ClipboardList, Rocket, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { fetchFlashcardStats } from '@/lib/api/flashcards';
import { fetchQuizStats } from '@/lib/api/quizzes';
import { fetchDashboard, fetchStudyMaterials, resetStudyPlan } from '@/lib/api/study-plans';
import { Button } from '@/components/ui/button';
import { ActiveStudyPlan } from '@/features/study-plans/ActiveStudyPlan';
import { PreparationCalendar } from './PreparationCalendar';
import { StatsPanel } from './StatsPanel';
import { ProgressCharts } from './ProgressCharts';
import { TaskList } from './TaskList';
import { UpcomingTasks } from './UpcomingTasks';
import type { DashboardResponse } from '@aws-exam-prep/types';
import type { StudyMaterialItem } from '@/lib/api/study-plans';

export function DashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [quizzesPassedTotal, setQuizzesPassedTotal] = useState(0);
  const [flashcardsStudiedTotal, setFlashcardsStudiedTotal] = useState(0);

  const loadDashboard = useCallback(
    async (accessToken: string): Promise<void> => {
      const dashboardData = await fetchDashboard(accessToken);
      setDashboard(dashboardData);

      try {
        const [quizStats, flashcardStats] = await Promise.all([
          fetchQuizStats(accessToken),
          fetchFlashcardStats(accessToken, dashboardData.studyPlan?.certificationId),
        ]);
        setQuizzesPassedTotal(quizStats.correctAttempts);
        setFlashcardsStudiedTotal(flashcardStats.reviewedCards);
      } catch {
        setQuizzesPassedTotal(0);
        setFlashcardsStudiedTotal(0);
      }

      if (!dashboardData.studyPlan) {
        setMaterials([]);
        return;
      }

      try {
        const nextMaterials = await fetchStudyMaterials(dashboardData.studyPlan.certificationId, accessToken);
        setMaterials(nextMaterials);
      } catch {
        setMaterials([]);
      }
    },
    [],
  );

  function handleTaskStatusChanged(taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'carried_over'): void {
    setDashboard((prev) => {
      if (!prev) return prev;

      const update = (tasks: typeof prev.todaysTasks) => tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task));

      return {
        ...prev,
        todaysTasks: update(prev.todaysTasks),
        carryOverTasks: update(prev.carryOverTasks),
      };
    });
  }

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
  const todayPlannedMinutes = dashboard.todaysTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const carryOverCount = dashboard.carryOverTasks.length;

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <ActiveStudyPlan
        studyPlan={studyPlan}
        token={token}
        isResetting={isResetting}
        onReset={() => { void handleResetStudyPlan(); }}
      />

      <section className='relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 via-card/95 to-indigo-500/15 p-5 shadow-[0_24px_60px_-36px_rgba(6,182,212,0.55)]'>
        <div className='pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-12 left-1/3 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl' />
        <div className='relative flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-2'>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300'>
              <Sparkles className='h-3.5 w-3.5' />
              Focus Command Center
            </span>
            <h2 className='text-2xl font-semibold text-foreground sm:text-3xl'>
              {studyPlan.certificationCode} preparation sprint
            </h2>
            <p className='max-w-2xl text-sm text-muted-foreground sm:text-base'>
              Track momentum, keep daily load balanced, and push readiness with clear milestones.
            </p>
          </div>

          <div className='grid w-full gap-2 sm:w-auto sm:grid-cols-2'>
            <QuickChip icon={Target} label='Exam Target' value={new Date(studyPlan.targetDate + 'T00:00:00').toLocaleDateString()} tone='amber' />
            <QuickChip icon={Rocket} label='Today Plan' value={`${dashboard.todaysTasks.length} tasks · ${todayPlannedMinutes}m`} tone='cyan' />
            <QuickChip icon={CalendarCheck} label='Carry-over' value={`${carryOverCount} tasks`} tone='rose' />
            <QuickChip icon={ClipboardList} label='Completed' value={`${stats.completedTasksTotal}`} tone='emerald' />
          </div>
        </div>
      </section>

      <section className='space-y-3'>
        <h3 className='text-sm uppercase tracking-[0.15em] text-muted-foreground'>Progress Snapshot</h3>
        <StatsPanel
          stats={stats}
          quizzesPassedTotal={quizzesPassedTotal}
          flashcardsStudiedTotal={flashcardsStudiedTotal}
        />
      </section>

      <section className='space-y-3'>
        <h3 className='text-sm uppercase tracking-[0.15em] text-muted-foreground'>Progress Charts</h3>
        <ProgressCharts
          plan={studyPlan}
          stats={stats}
          todaysTasks={dashboard.todaysTasks}
          carryOverTasks={dashboard.carryOverTasks}
          upcomingTasks={dashboard.upcomingTasks}
        />
      </section>

      <PreparationCalendar
        plan={studyPlan}
        todaysTasks={dashboard.todaysTasks}
        carryOverTasks={dashboard.carryOverTasks}
        upcomingTasks={dashboard.upcomingTasks}
      />

      <section className='grid gap-5 xl:grid-cols-[1.1fr_0.9fr]'>
        <div className='space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5'>
          <h3 className='text-sm uppercase tracking-[0.15em] text-muted-foreground'>Today and Recovery</h3>
          {token ? (
            <TaskList
              todaysTasks={dashboard.todaysTasks}
              carryOverTasks={dashboard.carryOverTasks}
              token={token}
              materials={materials}
              onStatusChanged={handleTaskStatusChanged}
            />
          ) : null}
        </div>

        <div className='space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5'>
          <h3 className='text-sm uppercase tracking-[0.15em] text-muted-foreground'>Upcoming Events</h3>
          <UpcomingTasks upcomingTasks={dashboard.upcomingTasks} />
        </div>
      </section>
    </div>
  );
}

function QuickChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'cyan' | 'amber' | 'rose' | 'emerald';
}) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
      : tone === 'amber'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : tone === 'rose'
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <p className='flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-current/85'>
        <Icon className='h-3.5 w-3.5' />
        {label}
      </p>
      <p className='mt-0.5 text-sm font-semibold text-current'>{value}</p>
    </div>
  );
}
