'use client';

import { Check, ChevronDown, Copy, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { fetchCertifications, fetchDashboard, fetchPlanSchedule, fetchStudyMaterials, rescheduleTask, resetStudyPlan } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActiveStudyPlan } from '@/features/study-plans/ActiveStudyPlan';
import { PlanScheduleView } from '@/features/study-plans/PlanScheduleView';
import { StudyPlanSetup } from '@/features/dashboard/StudyPlanSetup';
import { TaskList } from '@/features/dashboard/TaskList';
import type { DashboardResponse, PlanScheduleResponse, StudyTaskItem, TaskStatus, WeekSchedule } from '@aws-exam-prep/types';
import type { CertificationItem, StudyMaterialItem } from '@/lib/api/study-plans';

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  read: 'Docs',
  quiz: 'Quiz',
  flashcard: 'Flashcard',
  mock_exam: 'Practice Test',
  review: 'Review',
  course: 'Course',
  video: 'Video',
};

function fmtMin(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtFullDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function fmtDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return (
    new Date(start + 'T00:00:00').toLocaleDateString('en-US', opts) +
    ' – ' +
    new Date(end + 'T00:00:00').toLocaleDateString('en-US', opts)
  );
}

function buildSchedulePrompt(weeks: WeekSchedule[], materials: StudyMaterialItem[]): string {
  const materialById = new Map(materials.map((m) => [m.id, m]));
  const materialByTopicTitle = new Map<string, StudyMaterialItem>();
  for (const material of materials) {
    if (!material.topicTitle || !material.url) continue;
    const key = material.topicTitle.trim().toLowerCase();
    const existing = materialByTopicTitle.get(key);
    if (!existing || material.priority < existing.priority) {
      materialByTopicTitle.set(key, material);
    }
  }

  const totalTasks = weeks.reduce((s, w) => s + w.tasks.length, 0);
  const totalMin = weeks.reduce((s, w) => s + w.tasks.reduce((ts, t) => ts + t.estimatedMinutes, 0), 0);

  const lines: string[] = [
    '# AWS Certification Study Plan – Full Course Schedule',
    '',
    `${weeks.length} weeks · ${totalTasks} tasks · ${fmtMin(totalMin)} total`,
    '',
    'Please review this study schedule and validate:',
    '1. The logical progression of topics week by week',
    '2. The time estimates for each task',
    '3. Whether the provided links are appropriate for the topics',
    '4. Any gaps or overlaps in the learning path',
    '',
  ];

  for (const week of weeks) {
    const weekMin = week.tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
    lines.push(`## Week ${week.weekNumber} (${fmtDateRange(week.startDate, week.endDate)}) — ${fmtMin(weekMin)} total`);
    lines.push('');

    const tasksByDate = new Map<string, StudyTaskItem[]>();
    for (const task of week.tasks) {
      const existing = tasksByDate.get(task.scheduledDate) ?? [];
      existing.push(task);
      tasksByDate.set(task.scheduledDate, existing);
    }

    for (const date of Array.from(tasksByDate.keys()).sort()) {
      const dayTasks = tasksByDate.get(date) ?? [];
      const dayMin = dayTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
      lines.push(`### ${fmtFullDate(date)} — ${fmtMin(dayMin)}`);

      for (const task of dayTasks) {
        const material = task.externalResourceId
          ? materialById.get(task.externalResourceId)
          : task.type === 'quiz' && task.topicTitle
            ? materialByTopicTitle.get(task.topicTitle.trim().toLowerCase())
            : undefined;

        const url =
          task.type !== 'quiz' && task.type !== 'flashcard'
            ? (material?.url ?? task.topicResourceUrl ?? null)
            : null;

        const label = SCHEDULE_TYPE_LABELS[task.type] ?? task.type;
        const title = task.title ?? task.topicTitle ?? label;
        const statusSuffix =
          task.status === 'completed' ? ' ✓' :
          task.status === 'in_progress' ? ' ⏳' :
          task.status === 'carried_over' ? ' ⚠ missed' : '';

        lines.push(
          url
            ? `- [${title}](${url}) (${label}, ${fmtMin(task.estimatedMinutes)})${statusSuffix}`
            : `- ${title} (${label}, ${fmtMin(task.estimatedMinutes)})${statusSuffix}`,
        );
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

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
      window.dispatchEvent(new Event('study-plan-reset'));
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
    window.dispatchEvent(new Event('tasks-rescheduled'));
  }

  const [carriedOverExpanded, setCarriedOverExpanded] = useState(false);
  const [scheduleCopied, setScheduleCopied] = useState(false);

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

          {token && dashboard && dashboard.carryOverTasks.length > 0 && (
            <Card className='border-rose-500/25 bg-rose-500/5'>
              <button
                type='button'
                className='flex w-full min-w-0 items-center gap-3 px-5 py-3 text-left'
                onClick={() => setCarriedOverExpanded((v) => !v)}
                aria-expanded={carriedOverExpanded}
              >
                <span className='text-sm font-semibold text-foreground'>Carried Over</span>
                <span className='flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground'>
                  <span>{dashboard.carryOverTasks.length} missed task{dashboard.carryOverTasks.length !== 1 ? 's' : ''}</span>
                </span>
                <span className='shrink-0 text-xs text-muted-foreground'>
                  {dashboard.carryOverTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)} min
                </span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200', carriedOverExpanded && 'rotate-180')} />
              </button>
              {carriedOverExpanded && (
                <CardContent className='pt-0'>
                  <TaskList
                    todaysTasks={[]}
                    carryOverTasks={dashboard.carryOverTasks}
                    token={token}
                    materials={planMaterials}
                    onStatusChanged={handleTaskStatusChanged}
                    showOverview={false}
                    carryOverAlwaysExpanded
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Today's tasks — main content */}
          <Card className='border-border/70 bg-card/70'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-xl text-foreground'>Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {token && dashboard && (
                <TaskList
                  todaysTasks={dashboard.todaysTasks}
                  carryOverTasks={[]}
                  token={token}
                  materials={planMaterials}
                  onStatusChanged={handleTaskStatusChanged}
                />
              )}
            </CardContent>
          </Card>

          {/* Full course schedule */}
          <Card className='border-border/70 bg-card/70'>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={() => { setScheduleExpanded((v) => !v); }}
                className='flex flex-1 min-w-0 items-center gap-3 px-5 py-3 text-left'
              >
                <span className='text-sm font-semibold text-foreground'>Full Course Schedule</span>
                {schedule && (() => {
                  const weeks = schedule.weeks;
                  const totalTasks = weeks.reduce((s, w) => s + w.tasks.length, 0);
                  const completedTasks = weeks.reduce((s, w) => s + w.tasks.filter((t) => t.status === 'completed').length, 0);
                  const inProgressTasks = weeks.reduce((s, w) => s + w.tasks.filter((t) => t.status === 'in_progress').length, 0);
                  return (
                    <span className='flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground'>
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
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                    scheduleExpanded && 'rotate-180',
                  )}
                />
              </button>
              {schedule && (
                <div className='pr-3 shrink-0'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-1.5 text-xs'
                    onClick={() => {
                      const text = buildSchedulePrompt(schedule.weeks, planMaterials);
                      void navigator.clipboard.writeText(text).then(() => {
                        setScheduleCopied(true);
                        setTimeout(() => { setScheduleCopied(false); }, 2000);
                      });
                    }}
                  >
                    {scheduleCopied
                      ? <Check className='h-3.5 w-3.5 text-emerald-500' />
                      : <Copy className='h-3.5 w-3.5' />}
                    {scheduleCopied ? 'Copied!' : 'Copy as Prompt'}
                  </Button>
                </div>
              )}
            </div>
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
