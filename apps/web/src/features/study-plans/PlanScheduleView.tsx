'use client';

import { CheckCircle2, ChevronDown, ExternalLink, GripVertical, Loader2 } from 'lucide-react';
import { type DragEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StudyMaterialItem } from '@/lib/api/study-plans';

export interface ScheduleTask {
  id: string;
  type: string;
  status: string;
  scheduledDate: string;
  topicTitle: string | null;
  title: string | null;
  externalResourceId: string | null;
  topicResourceUrl: string | null;
  estimatedMinutes: number;
}

export interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasks: ScheduleTask[];
}

interface Props {
  weeks: WeekSchedule[];
  materials: StudyMaterialItem[];
  onReschedule?: (taskId: string, targetDate: string) => Promise<void>;
}

const TYPE_LABELS: Record<string, string> = {
  read: 'Docs',
  quiz: 'Quiz',
  flashcard: 'Flashcard',
  mock_exam: 'Practice Test',
  review: 'Review',
  course: 'Course',
  video: 'Video',
};

const TYPE_COLORS: Record<string, string> = {
  read: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  quiz: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  flashcard: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  mock_exam: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  review: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  course: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  video: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function normalizeTopicTitle(value: string): string {
  return value.trim().toLowerCase();
}

export function PlanScheduleView({ weeks, materials, onReschedule }: Props) {
  const today = new Date().toISOString().split('T')[0]!;
  const materialById = new Map(materials.map((m) => [m.id, m]));
  const materialByTopicTitle = new Map<string, StudyMaterialItem>();
  for (const material of materials) {
    if (!material.topicTitle || !material.url) continue;
    const key = normalizeTopicTitle(material.topicTitle);
    const existing = materialByTopicTitle.get(key);
    if (!existing || material.priority < existing.priority) {
      materialByTopicTitle.set(key, material);
    }
  }

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => {
    const currentWeek = weeks.find((w) => w.startDate <= today && w.endDate >= today);
    if (currentWeek) return new Set([currentWeek.weekNumber]);
    const firstFutureWeek = weeks.find((w) => w.endDate >= today);
    return firstFutureWeek ? new Set([firstFutureWeek.weekNumber]) : new Set(weeks.slice(0, 1).map((w) => w.weekNumber));
  });

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingFromDate, setDraggingFromDate] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<Set<string>>(new Set());

  function toggleWeek(weekNumber: number): void {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  }

  function handleDragStart(taskId: string, fromDate: string): void {
    setDraggingTaskId(taskId);
    setDraggingFromDate(fromDate);
  }

  function handleDragEnd(): void {
    setDraggingTaskId(null);
    setDraggingFromDate(null);
    setDragOverDate(null);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, date: string): void {
    if (!draggingTaskId || !onReschedule) return;
    e.preventDefault();
    setDragOverDate(date);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>): void {
    const target = e.currentTarget as HTMLElement;
    if (!target.contains(e.relatedTarget as Node)) {
      setDragOverDate(null);
    }
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>, targetDate: string): Promise<void> {
    e.preventDefault();
    if (!draggingTaskId || !onReschedule || draggingFromDate === targetDate) {
      handleDragEnd();
      return;
    }
    const taskId = draggingTaskId;
    handleDragEnd();
    setRescheduling((prev) => new Set(prev).add(taskId));
    try {
      await onReschedule(taskId, targetDate);
    } finally {
      setRescheduling((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }

  if (weeks.length === 0) {
    return (
      <p className='text-sm italic text-muted-foreground'>
        No schedule found. The plan may still be generating tasks.
      </p>
    );
  }

  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedTasks = weeks.reduce((sum, w) => sum + w.tasks.filter((t) => t.status === 'completed').length, 0);
  const inProgressTasks = weeks.reduce((sum, w) => sum + w.tasks.filter((t) => t.status === 'in_progress').length, 0);

  return (
    <div className='space-y-3'>
      {/* Overall progress summary */}
      <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
        <span>{weeks.length} week{weeks.length !== 1 ? 's' : ''}</span>
        <span className='text-border'>·</span>
        <span>{totalTasks} tasks total</span>
        <span className='text-border'>·</span>
        <span className='text-emerald-600 dark:text-emerald-400'>{completedTasks} completed</span>
        {inProgressTasks > 0 && (
          <>
            <span className='text-border'>·</span>
            <span className='text-amber-600 dark:text-amber-400'>{inProgressTasks} in progress</span>
          </>
        )}
      </div>

      {weeks.map((week) => {
        const weekCompleted = week.tasks.filter((t) => t.status === 'completed').length;
        const weekInProgress = week.tasks.filter((t) => t.status === 'in_progress').length;
        const weekTotal = week.tasks.length;
        const isExpanded = expandedWeeks.has(week.weekNumber);
        const isFullyDone = weekCompleted === weekTotal && weekTotal > 0;
        const isCurrentWeek = week.startDate <= today && week.endDate >= today;

        // Group tasks by date
        const tasksByDate = new Map<string, ScheduleTask[]>();
        for (const task of week.tasks) {
          const existing = tasksByDate.get(task.scheduledDate) ?? [];
          existing.push(task);
          tasksByDate.set(task.scheduledDate, existing);
        }
        const sortedDates = Array.from(tasksByDate.keys()).sort();

        return (
          <div key={week.weekNumber} className={cn('overflow-hidden rounded-xl border bg-card/70', isCurrentWeek ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-border/70')}>
            {/* Week header */}
            <button
              type='button'
              onClick={() => { toggleWeek(week.weekNumber); }}
              className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30'
            >
              <div className='flex items-center gap-3'>
                <Badge
                  variant='outline'
                  className={cn('shrink-0 font-semibold', isFullyDone && 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400', isCurrentWeek && !isFullyDone && 'border-cyan-500/50 text-cyan-700 dark:text-cyan-400')}
                >
                  Week {week.weekNumber}
                </Badge>
                {isCurrentWeek && (
                  <Badge className='shrink-0 bg-cyan-500/15 text-xs font-medium text-cyan-700 dark:text-cyan-300'>
                    This Week
                  </Badge>
                )}
                <span className='text-sm text-muted-foreground'>{formatDateRange(week.startDate, week.endDate)}</span>
              </div>
              <div className='flex items-center gap-3'>
                {isFullyDone ? (
                  <span className='flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3.5 w-3.5' />
                    Done
                  </span>
                ) : (
                  <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                    {weekInProgress > 0 && (
                      <span className='flex items-center gap-1 text-amber-600 dark:text-amber-400'>
                        <Loader2 className='h-3 w-3' />
                        {weekInProgress} in progress
                      </span>
                    )}
                    <span>{weekCompleted}/{weekTotal} done</span>
                  </span>
                )}
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-180')}
                />
              </div>
            </button>

            {/* Tasks by day */}
            {isExpanded && (
              <div className='divide-y divide-border/40 border-t border-border/60'>
                {sortedDates.map((date) => {
                  const dayTasks = tasksByDate.get(date) ?? [];
                  const isToday = date === today;

                  const dayTotalMinutes = dayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

                  return (
                    <div
                      key={date}
                      className={cn(
                        'px-4 py-3 transition-colors',
                        isToday && 'bg-cyan-500/5',
                        dragOverDate === date && draggingFromDate !== date && !!onReschedule && 'bg-blue-500/10 ring-1 ring-inset ring-blue-500/40',
                      )}
                      onDragOver={(e) => { handleDragOver(e, date); }}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => { void handleDrop(e, date); }}
                    >
                      <div className='mb-2.5 flex items-center justify-between gap-2'>
                        <p className={cn(
                          'text-xs font-semibold uppercase tracking-[0.14em]',
                          isToday ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground',
                        )}>
                          {isToday ? 'Today — ' : ''}{formatDate(date)}
                        </p>
                        <span className='shrink-0 text-xs text-muted-foreground'>{formatMinutes(dayTotalMinutes)}</span>
                      </div>
                      <div className='space-y-2'>
                        {dayTasks.map((task) => {
                          const material = task.externalResourceId
                            ? materialById.get(task.externalResourceId)
                            : task.type === 'quiz' && task.topicTitle
                              ? materialByTopicTitle.get(normalizeTopicTitle(task.topicTitle))
                              : undefined;
                          const typeColorClass = TYPE_COLORS[task.type] ?? 'bg-muted text-muted-foreground';
                          const isCompleted = task.status === 'completed';
                          const isInProgress = task.status === 'in_progress';

                          return (
                            <div
                              key={task.id}
                              draggable={!!onReschedule}
                              onDragStart={() => { handleDragStart(task.id, date); }}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                'flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-opacity',
                                !!onReschedule && 'cursor-grab active:cursor-grabbing',
                                draggingTaskId === task.id && 'opacity-40',
                                isCompleted
                                  ? 'border-emerald-500/30 bg-emerald-500/5'
                                  : isInProgress
                                    ? 'border-amber-500/30 bg-amber-500/5'
                                    : 'border-border/50 bg-background/50',
                              )}
                            >
                              {/* Left: drag handle + icon + title + tags */}
                              <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
                                {!!onReschedule && (
                                  <GripVertical className='h-4 w-4 shrink-0 text-muted-foreground/40' />
                                )}
                                {isCompleted && (
                                  <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-500' />
                                )}
                                {isInProgress && (
                                  <Loader2 className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                                )}
                                <span
                                  className={cn(
                                    'min-w-0 truncate text-sm font-medium',
                                    isCompleted && 'text-muted-foreground line-through decoration-muted-foreground/40',
                                    isInProgress && 'text-amber-700 dark:text-amber-300',
                                  )}
                                >
                                  {task.title ?? task.topicTitle ?? TYPE_LABELS[task.type] ?? task.type}
                                </span>

                                {/* Type tag */}
                                <Badge className={cn('shrink-0 text-xs', typeColorClass)}>
                                  {TYPE_LABELS[task.type] ?? task.type}
                                </Badge>

                                {/* Free / Paid tag */}
                                {material !== undefined && (
                                  <Badge
                                    variant='outline'
                                    className={cn(
                                      'shrink-0 text-xs',
                                      material.isFree
                                        ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                        : 'border-amber-500/40 text-amber-600 dark:text-amber-400',
                                    )}
                                  >
                                    {material.isFree ? 'Free' : 'Paid'}
                                  </Badge>
                                )}

                                <span className='text-xs text-muted-foreground'>{task.estimatedMinutes}m</span>
                              </div>

                              {/* Right: rescheduling indicator + link */}
                              <div className='flex shrink-0 items-center gap-2'>
                                {rescheduling.has(task.id) && (
                                  <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
                                )}
                                {(material?.url ?? task.topicResourceUrl) && (
                                  <Button asChild size='sm' className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
                                    <a href={material?.url ?? task.topicResourceUrl!} target='_blank' rel='noreferrer'>
                                      <ExternalLink className='h-3.5 w-3.5' />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
