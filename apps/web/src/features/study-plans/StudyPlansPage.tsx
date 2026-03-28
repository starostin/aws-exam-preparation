'use client';

import { ChevronDown, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { fetchCertifications, fetchDashboard, fetchPlanSchedule, fetchStudyMaterials, rescheduleTask, resetStudyPlan } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActiveStudyPlan } from '@/features/study-plans/ActiveStudyPlan';
import { PlanScheduleView } from '@/features/study-plans/PlanScheduleView';
import { StudyPlanSetup } from '@/features/dashboard/StudyPlanSetup';
import { TaskList } from '@/features/dashboard/TaskList';
import type { DashboardResponse, PlanScheduleResponse, StudyTaskItem, TaskStatus } from '@aws-exam-prep/types';
import type { CertificationItem, StudyMaterialItem } from '@/lib/api/study-plans';

export function StudyPlansPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [token, setToken] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<PlanScheduleResponse | null>(null);
  const [planMaterials, setPlanMaterials] = useState<StudyMaterialItem[]>([]);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  const loadData = useCallback(async (accessToken: string): Promise<void> => {
    const [dashboardData, certData] = await Promise.all([
      fetchDashboard(accessToken),
      fetchCertifications(accessToken),
    ]);
    setDashboard(dashboardData);
    setCertifications(certData);
    if (dashboardData.studyPlan) {
      const [scheduleData, mats] = await Promise.all([
        fetchPlanSchedule(accessToken),
        fetchStudyMaterials(dashboardData.studyPlan.certificationId, accessToken),
      ]);
      setSchedule(scheduleData);
      setPlanMaterials(mats);
    } else {
      setSchedule(null);
      setPlanMaterials([]);
    }
  }, []);

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
        await loadData(accessToken);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => { isMounted = false; };
  }, [supabase, loadData]);

  function handleTaskStatusChanged(taskId: string, newStatus: TaskStatus): void {
    setDashboard((prev) => {
      if (!prev) return prev;

      function updateInList(list: StudyTaskItem[]): StudyTaskItem[] {
        return list.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      }

      return {
        ...prev,
        todaysTasks: updateInList(prev.todaysTasks),
        carryOverTasks: updateInList(prev.carryOverTasks),
      };
    });

    setSchedule((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          tasks: week.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
        })),
      };
    });
  }

  async function handlePlanCreated(): Promise<void> {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetStudyPlan(): Promise<void> {
    if (!token) return;
    if (!window.confirm('Are you sure you want to reset your study plan? All progress will be cleared.')) return;
    setIsResetting(true);
    setResetMessage(null);
    try {
      await resetStudyPlan(token);
      setResetMessage('Study plan reset. Set up a new one below.');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setDashboard(null);
      setSchedule(null);
      setPlanMaterials([]);
      setResetMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset study plan');
    } finally {
      setIsResetting(false);
    }
  }

  async function handleRescheduleToDate(taskId: string, targetDate: string): Promise<void> {
    if (!token) return;
    // Optimistically update schedule
    setSchedule((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => ({
          ...week,
          tasks: week.tasks.map((t) => (t.id === taskId ? { ...t, scheduledDate: targetDate } : t)),
        })),
      };
    });
    await rescheduleTask(taskId, { targetDate }, token);
    const [refreshed, refreshedSchedule] = await Promise.all([fetchDashboard(token), fetchPlanSchedule(token)]);
    setDashboard(refreshed);
    setSchedule(refreshedSchedule);
  }

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading study plans...</p>;
  }

  if (error) {
    return <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>;
  }

  const studyPlan = dashboard?.studyPlan;

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      {!studyPlan && (
        <div className='space-y-2'>
          <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>
            <Sparkles className='mr-1 h-3.5 w-3.5' />
            Study Plans
          </Badge>
          <h2 className='text-3xl font-semibold text-foreground'>Manage Your Study Plan</h2>
          <p className='text-sm text-muted-foreground'>
            Create, review, and manage your certification study schedule.
          </p>
        </div>
      )}

      {resetMessage && (
        <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-200'>
          {resetMessage}
        </div>
      )}

      {studyPlan ? (
        <div className='flex flex-col gap-5'>
          {/* Plan overview */}
          <ActiveStudyPlan
            studyPlan={studyPlan}
            isResetting={isResetting}
            onReset={() => { void handleResetStudyPlan(); }}
            token={token}
          />

          {/* Today's tasks — main content */}
          <Card className='border-border/70 bg-card/70'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-xl text-foreground'>Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {token && dashboard && (
                <TaskList
                  todaysTasks={dashboard.todaysTasks}
                  carryOverTasks={dashboard.carryOverTasks}
                  token={token}
                  materials={planMaterials}
                  onStatusChanged={handleTaskStatusChanged}
                />
              )}
            </CardContent>
          </Card>

          {/* Full course schedule */}
          <Card className='border-border/70 bg-card/70'>
            <CardHeader className='px-5 py-3'>
              <button
                type='button'
                onClick={() => { setScheduleExpanded((v) => !v); }}
                className='flex w-full items-center justify-between gap-3 text-left'
              >
                <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
                  <CardTitle className='text-xl text-foreground'>Full Course Schedule</CardTitle>
                  {!scheduleExpanded && schedule && (() => {
                    const weeks = schedule.weeks;
                    const totalTasks = weeks.reduce((s, w) => s + w.tasks.length, 0);
                    const completedTasks = weeks.reduce((s, w) => s + w.tasks.filter((t) => t.status === 'completed').length, 0);
                    const inProgressTasks = weeks.reduce((s, w) => s + w.tasks.filter((t) => t.status === 'in_progress').length, 0);
                    return (
                      <span className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <span>{weeks.length} week{weeks.length !== 1 ? 's' : ''}</span>
                        <span className='text-border'>·</span>
                        <span>{totalTasks} tasks</span>
                        <span className='text-border'>·</span>
                        <span className='text-emerald-600 dark:text-emerald-400'>{completedTasks} completed</span>
                        {inProgressTasks > 0 && (
                          <>
                            <span className='text-border'>·</span>
                            <span className='text-amber-600 dark:text-amber-400'>{inProgressTasks} in progress</span>
                          </>
                        )}
                      </span>
                    );
                  })()}
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                    scheduleExpanded && 'rotate-180',
                  )}
                />
              </button>
            </CardHeader>
            {scheduleExpanded && (
              <CardContent>
                <PlanScheduleView
                  weeks={schedule?.weeks ?? []}
                  materials={planMaterials}
                  {...(token ? { onReschedule: handleRescheduleToDate } : {})}
                />
              </CardContent>
            )}
          </Card>
        </div>
      ) : (
        token && certifications.length > 0 && (
          <StudyPlanSetup
            certifications={certifications}
            token={token}
            onCreated={() => { void handlePlanCreated(); }}
          />
        )
      )}
    </div>
  );
}
