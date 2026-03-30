'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpen, CalendarClock, CheckCheck, ClipboardList, FileCheck2, HelpCircle, LayoutDashboard, Layers, LogOut, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchDashboard } from '@/lib/api/study-plans';
import { cn } from '@/lib/utils';
import { signOutCurrentUser } from '@/lib/auth/auth-service';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { ThemeSwitcher } from './theme-switcher';

interface AppShellProps {
  children: ReactNode;
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith('/auth');
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayTaskCount, setTodayTaskCount] = useState<number | null>(null);
  const [missedTaskCount, setMissedTaskCount] = useState<number | null>(null);
  const [completedTaskCount, setCompletedTaskCount] = useState<number | null>(null);
  const [studyPlanDates, setStudyPlanDates] = useState<{ startDate: string; targetDate: string } | null>(null);

  const studyPlanProgress = useMemo(() => {
    if (!studyPlanDates) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(studyPlanDates.startDate + 'T00:00:00');
    const end = new Date(studyPlanDates.targetDate + 'T00:00:00');
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    const daysSpent = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000));
    const daysLeft = Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
    const pct = Math.min(100, Math.round((daysSpent / totalDays) * 100));
    return { daysSpent, daysLeft, pct, totalDays };
  }, [studyPlanDates]);

  const fetchBadgeCounts = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return;
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) return;
    try {
      const dashboard = await fetchDashboard(accessToken);
      setTodayTaskCount(dashboard.todaysTasks.length);
      setMissedTaskCount(dashboard.carryOverTasks.length);
      setCompletedTaskCount(Number(dashboard.stats.completedTasksTotal));
      if (dashboard.studyPlan) {
        setStudyPlanDates({ startDate: dashboard.studyPlan.startDate, targetDate: dashboard.studyPlan.targetDate });
      }
    } catch {
      // Ignore
    }
  }, [supabase]);

  useEffect(() => {
    if (isAuthPath(pathname)) {
      setLoadingUser(false);
      return;
    }

    let isMounted = true;

    async function loadUser(): Promise<void> {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (userError) {
        setError(userError.message);
        setLoadingUser(false);
        return;
      }

      setEmail(data.user?.email ?? null);
      setLoadingUser(false);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted || sessionError) return;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;

      try {
        const dashboard = await fetchDashboard(accessToken);
        if (!isMounted) return;

        setTodayTaskCount(dashboard.todaysTasks.length);
        setMissedTaskCount(dashboard.carryOverTasks.length);
        setCompletedTaskCount(Number(dashboard.stats.completedTasksTotal));
        if (dashboard.studyPlan) {
          setStudyPlanDates({ startDate: dashboard.studyPlan.startDate, targetDate: dashboard.studyPlan.targetDate });
        }
      } catch {
        // Keep header available even if dashboard data is temporarily unavailable.
      }
    }

    void loadUser();

    function handleStudyPlanReset(): void {
      setTodayTaskCount(0);
      setMissedTaskCount(0);
      setCompletedTaskCount(0);
      setStudyPlanDates(null);
    }

    function handleStudyPlanCreated(): void {
      void fetchBadgeCounts();
    }

    function handleTasksRescheduled(): void {
      void fetchBadgeCounts();
    }

    function handleTaskStatusChanged(e: Event): void {
      const { from, to } = (e as CustomEvent<{ from: string; to: string }>).detail;
      if (to === 'completed') {
        setCompletedTaskCount((prev) => (prev ?? 0) + 1);
      } else if (from === 'completed') {
        setCompletedTaskCount((prev) => Math.max(0, (prev ?? 0) - 1));
      }
    }

    window.addEventListener('study-plan-reset', handleStudyPlanReset);
    window.addEventListener('study-plan-created', handleStudyPlanCreated);
    window.addEventListener('tasks-rescheduled', handleTasksRescheduled);
    window.addEventListener('task-status-changed', handleTaskStatusChanged);

    return () => {
      isMounted = false;
      window.removeEventListener('study-plan-reset', handleStudyPlanReset);
      window.removeEventListener('study-plan-created', handleStudyPlanCreated);
      window.removeEventListener('tasks-rescheduled', handleTasksRescheduled);
      window.removeEventListener('task-status-changed', handleTaskStatusChanged);
    };
  }, [pathname, supabase, fetchBadgeCounts]);

  async function handleSignOut(): Promise<void> {
    setError(null);
    try {
      await signOutCurrentUser();
      setEmail(null);
      router.push('/auth/sign-in');
      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out');
    }
  }

  if (isAuthPath(pathname)) {
    return <>{children}</>;
  }

  if (loadingUser) {
    return (
      <main className='grid min-h-screen place-items-center bg-background text-muted-foreground'>
        Loading your dashboard...
      </main>
    );
  }

  const navItems: Array<{ href: '/' | '/study-plans' | '/quizzes' | '/flashcards' | '/mock-exams'; label: string; icon: LucideIcon }> = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/study-plans', label: 'Study Plans', icon: ClipboardList },
    { href: '/quizzes', label: 'Quizzes', icon: HelpCircle },
    { href: '/flashcards', label: 'Flashcards', icon: Layers },
    { href: '/mock-exams', label: 'Mock Exams', icon: FileCheck2 },
  ];

  return (
    <main className='relative h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(6,182,212,0.12),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.14),transparent_35%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(19,164,181,0.16),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(24,64,160,0.2),transparent_35%)]' />

      <div className='relative mx-auto flex h-[calc(100vh-2rem)] w-full max-w-[1600px] overflow-hidden rounded-3xl border border-border/70 bg-card/75 backdrop-blur-sm animate-rise-in'>
        <aside className='hidden w-72 flex-col border-r border-border/70 bg-card/90 p-5 lg:flex'>
          <div className='mb-10'>
            <p className='text-xs uppercase tracking-[0.2em] text-cyan-300/80'>AWS Focus Mode</p>
            <h1 className='mt-2 text-2xl font-semibold text-foreground'>Exam Preparation</h1>
            <p className='mt-2 text-sm text-muted-foreground'>Structure your learning sprint with a calm and consistent rhythm.</p>
          </div>

          <nav className='space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          </nav>

          <div className='mt-auto flex flex-col gap-3'>
            <Link
              href='/materials'
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                pathname === '/materials' || pathname.startsWith('/materials')
                  ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'
                  : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
              )}
            >
              <BookOpen className='h-4 w-4' />
              <span>Study Materials</span>
            </Link>

            <div className='rounded-xl border border-border bg-background/60 p-4'>
              <p className='text-xs uppercase tracking-widest text-muted-foreground'>Signed in as</p>
              <p className='mt-1 truncate text-sm text-foreground'>{email ?? 'No user email found'}</p>
            </div>
          </div>
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          <header className='border-b border-border/70 bg-card/70 px-4 py-4 sm:px-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-wrap items-center gap-2 sm:gap-3'>

                {studyPlanProgress && (
                  <div
                    className='inline-flex items-center gap-2.5 overflow-hidden rounded-xl border border-border/70 bg-background/70 px-3 py-1.5'
                    title={studyPlanDates ? `${studyPlanDates.startDate} → ${studyPlanDates.targetDate}` : undefined}
                  >
                    <Target className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                    <span className='text-xs font-semibold text-cyan-600 dark:text-cyan-400'>
                      {studyPlanProgress.daysSpent}d
                    </span>
                    <div className='relative h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted/80 sm:w-24'>
                      <div
                        className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-700'
                        style={{ width: `${studyPlanProgress.pct}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        studyPlanProgress.daysLeft <= 7
                          ? 'text-rose-600 dark:text-rose-400'
                          : studyPlanProgress.daysLeft <= 14
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400',
                      )}
                    >
                      {studyPlanProgress.daysLeft}d
                    </span>
                    <span className='hidden text-xs text-muted-foreground sm:inline'>left</span>
                  </div>
                )}

                <div className='inline-flex items-center overflow-hidden rounded-xl border border-border/70 bg-background/70'>
                  <span className='flex items-center gap-1.5 border-r border-cyan-500/25 px-2.5 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-200'>
                    <ClipboardList className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>Today</span>
                    <span>{todayTaskCount ?? '...'}</span>
                  </span>
                  <span className='flex items-center gap-1.5 border-r border-rose-500/25 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300'>
                    <CalendarClock className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>Missed</span>
                    <span>{missedTaskCount ?? '...'}</span>
                  </span>
                  <span className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                    <CheckCheck className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>Done</span>
                    <span>{completedTaskCount ?? '...'}</span>
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <ThemeSwitcher />
                <span className='hidden max-w-52 truncate text-sm text-muted-foreground sm:inline'>{email ?? 'No user email found'}</span>
                <Button
                  type='button'
                  variant='outline'
                  className='border-border bg-background/70 text-foreground hover:bg-muted'
                  onClick={() => {
                    void handleSignOut();
                  }}
                >
                  <LogOut className='h-4 w-4' />
                  Sign out
                </Button>
              </div>
            </div>

            <nav className='mt-4 flex gap-2 lg:hidden'>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium',
                      isActive ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200' : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <section className='flex-1 overflow-auto px-4 py-5 sm:px-6'>{children}</section>

          {error ? <p className='border-t border-border/70 px-6 py-3 text-sm text-destructive'>{error}</p> : null}
          </div>
      </div>
    </main>
  );
}
