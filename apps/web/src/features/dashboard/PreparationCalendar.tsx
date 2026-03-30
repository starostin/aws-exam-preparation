import { CalendarCheck2, CalendarDays, Flag, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStudyPlan, StudyTaskItem, UpcomingDay } from '@aws-exam-prep/types';

interface Props {
  plan: DashboardStudyPlan;
  todaysTasks: StudyTaskItem[];
  carryOverTasks: StudyTaskItem[];
  upcomingTasks: UpcomingDay[];
}

interface DayCell {
  date: string;
  dateObj: Date;
  taskCount: number;
  completedCount: number;
  minutes: number;
  isToday: boolean;
  isPast: boolean;
  isExamDay: boolean;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return toIsoDate(parsed);
  }

  return value;
}

function toIsoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function startOfCalendar(date: Date): Date {
  const value = new Date(date);
  const day = value.getDay();
  const shift = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + shift);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfCalendar(date: Date): Date {
  const value = new Date(date);
  const day = value.getDay();
  const shift = day === 0 ? 0 : 7 - day;
  value.setDate(value.getDate() + shift);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function PreparationCalendar({ plan, todaysTasks, carryOverTasks, upcomingTasks }: Props) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const examDate = parseDate(plan.targetDate);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const gridStart = startOfCalendar(monthStart);
  const gridEnd = endOfCalendar(monthEnd);
  const totalGridDays =
    Math.floor((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const taskMap = new Map<string, { count: number; completed: number; minutes: number }>();
  const aggregate = (date: string, tasks: StudyTaskItem[]) => {
    const current = taskMap.get(date) ?? { count: 0, completed: 0, minutes: 0 };
    current.count += tasks.length;
    current.completed += tasks.filter((task) => task.status === 'completed').length;
    current.minutes += tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    taskMap.set(date, current);
  };

  aggregate(toIsoDate(now), [...todaysTasks, ...carryOverTasks]);
  upcomingTasks.forEach((day) => aggregate(toDateKey(day.date), day.tasks));

  const cells: DayCell[] = Array.from({ length: totalGridDays }).map((_, index) => {
    const dateObj = new Date(gridStart);
    dateObj.setDate(gridStart.getDate() + index);
    const date = toIsoDate(dateObj);
    const dayStats = taskMap.get(date) ?? { count: 0, completed: 0, minutes: 0 };

    return {
      date,
      dateObj,
      taskCount: dayStats.count,
      completedCount: dayStats.completed,
      minutes: dayStats.minutes,
      isToday: date === toIsoDate(now),
      isPast: dateObj.getTime() < now.getTime(),
      isExamDay: date === toDateKey(plan.targetDate),
    };
  });

  const upcomingLoad = upcomingTasks
    .slice(0, 7)
    .reduce((sum, day) => sum + day.tasks.length, 0);
  const carryLoad = carryOverTasks.length;
  const todayLoad = todaysTasks.length;
  const completedLoad = cells.reduce((sum, cell) => sum + cell.completedCount, 0);
  const daysToExam = Math.max(
    0,
    Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <section className='rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-background/95 to-indigo-500/10 p-4 sm:p-5'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-xs uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300'>Calendar Pulse</p>
          <h3 className='mt-1 text-lg font-semibold text-foreground'>Preparation Events</h3>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-700 dark:text-cyan-300'>
            {new Date(now.getFullYear(), now.getMonth()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <span className='rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300'>
            {daysToExam}d to exam
          </span>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1.5'>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className='pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
            {label}
          </div>
        ))}

        {cells.map((cell, index) => {
          const inCurrentMonth = cell.dateObj.getMonth() === now.getMonth();
          const intensity = cell.taskCount > 0 ? Math.min(4, cell.taskCount) : 0;

          return (
            <div
              key={cell.date}
              className={cn(
                'group relative min-h-[72px] rounded-xl border p-2 transition-all duration-300',
                inCurrentMonth
                  ? 'border-border/60 bg-card/65'
                  : 'border-border/30 bg-card/40 opacity-50',
                cell.isToday && 'border-cyan-400/70 bg-cyan-500/10 shadow-[0_0_24px_rgba(6,182,212,0.18)]',
                cell.isExamDay && 'border-amber-400/70 bg-amber-500/10',
                !cell.isToday && !cell.isExamDay && !cell.isPast && 'hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-500/5',
                'animate-rise-in',
              )}
              style={{ animationDelay: `${Math.min(0.7, index * 0.02)}s` }}
            >
              <div className='flex items-start justify-between gap-1'>
                <span className='text-xs font-medium text-foreground'>
                  {cell.dateObj.getDate()}
                </span>
                {cell.isExamDay ? <Target className='h-3.5 w-3.5 text-amber-500' /> : null}
                {cell.isToday ? <Sparkles className='h-3.5 w-3.5 text-cyan-500' /> : null}
              </div>

              <div className='mt-2 space-y-1'>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-border/40'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      intensity === 0 && 'w-0',
                      intensity === 1 && 'w-1/4 bg-emerald-400',
                      intensity === 2 && 'w-2/4 bg-cyan-400',
                      intensity === 3 && 'w-3/4 bg-indigo-400',
                      intensity === 4 && 'w-full bg-violet-400',
                    )}
                  />
                </div>
                <p className='text-[10px] text-muted-foreground'>
                  {cell.taskCount > 0 ? `${cell.taskCount} tasks` : 'No tasks'}
                </p>
                {cell.completedCount > 0 ? (
                  <p className='text-[10px] text-emerald-600 dark:text-emerald-300'>
                    {cell.completedCount} completed
                  </p>
                ) : null}
                {cell.minutes > 0 ? (
                  <p className='text-[10px] text-muted-foreground'>{cell.minutes}m</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-4 grid gap-2 sm:grid-cols-4'>
        <MilestoneChip icon={CalendarDays} label='Today load' value={`${todayLoad} tasks`} tone='cyan' />
        <MilestoneChip icon={CalendarCheck2} label='Completed' value={`${completedLoad} tasks`} tone='emerald' />
        <MilestoneChip icon={Flag} label='Carry-over' value={`${carryLoad} tasks`} tone='rose' />
        <MilestoneChip icon={Target} label='Next 7 days' value={`${upcomingLoad} tasks`} tone='indigo' />
      </div>
    </section>
  );
}

function MilestoneChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'cyan' | 'emerald' | 'rose' | 'indigo';
}) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
      : tone === 'emerald'
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : tone === 'rose'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300';

  return (
    <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2', toneClass)}>
      <Icon className='h-4 w-4' />
      <div>
        <p className='text-[11px] uppercase tracking-[0.12em] text-current/80'>{label}</p>
        <p className='text-sm font-semibold text-current'>{value}</p>
      </div>
    </div>
  );
}