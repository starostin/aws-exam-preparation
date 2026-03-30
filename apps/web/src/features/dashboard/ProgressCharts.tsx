import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats, DashboardStudyPlan, StudyTaskItem, UpcomingDay } from '@aws-exam-prep/types';

interface Props {
  plan: DashboardStudyPlan;
  stats: DashboardStats;
  todaysTasks: StudyTaskItem[];
  carryOverTasks: StudyTaskItem[];
  upcomingTasks: UpcomingDay[];
}

function toLocalDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return toLocalDateKey(parsed);
  }

  return value;
}

function DaysTimeline({ plan }: { plan: DashboardStudyPlan }) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const startMs = new Date(`${plan.startDate}T00:00:00`).getTime();
  const targetMs = new Date(`${plan.targetDate}T00:00:00`).getTime();
  const todayMs = todayDate.getTime();

  const totalDays = Math.max(1, Math.ceil((targetMs - startMs) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, Math.ceil((targetMs - todayMs) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.max(0, Math.min(100, Math.round((daysLeft / totalDays) * 100)));

  return (
    <div className='space-y-2'>
      <div className='flex justify-between text-sm'>
        <span className='text-muted-foreground'>Days Until Exam</span>
        <span className='font-semibold text-foreground'>
          {daysLeft > 0 ? `${daysLeft} days` : 'Today!'}
        </span>
      </div>
      <div className='h-2.5 w-full overflow-hidden rounded-full bg-border/50'>
        <div
          className='h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 transition-all duration-700'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className='text-right text-xs text-muted-foreground'>
        Exam: {new Date(plan.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

function WeeklyLoadBars({
  todaysTasks,
  carryOverTasks,
  upcomingTasks,
}: {
  todaysTasks: StudyTaskItem[];
  carryOverTasks: StudyTaskItem[];
  upcomingTasks: UpcomingDay[];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const map = new Map<string, number>();

  const todayKey = toLocalDateKey(today);
  map.set(
    todayKey,
    [...todaysTasks, ...carryOverTasks].reduce((sum, task) => sum + task.estimatedMinutes, 0),
  );

  upcomingTasks.forEach((day) => {
    const dayKey = normalizeDateKey(day.date);
    map.set(
      dayKey,
      (map.get(dayKey) ?? 0) + day.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
    );
  });

  const bars = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() + index);
    const key = toLocalDateKey(day);
    const minutes = map.get(key) ?? 0;
    const label = dayLabels[(day.getDay() + 6) % 7];
    return { label, minutes, isToday: index === 0 };
  });

  const maxMinutes = Math.max(1, ...bars.map((bar) => bar.minutes));

  return (
    <div className='space-y-2'>
      <p className='text-sm text-muted-foreground'>Weekly workload forecast</p>
      <div className='grid grid-cols-7 gap-2'>
        {bars.map((bar) => (
          <div key={bar.label} className='space-y-1'>
            <div className='flex h-24 items-end'>
              <div className='relative h-full w-full overflow-hidden rounded-lg border border-border/60 bg-border/30'>
                <div
                  className='absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-700'
                  style={{ height: `${Math.max(4, Math.round((bar.minutes / maxMinutes) * 100))}%` }}
                />
              </div>
            </div>
            <p className='text-center text-[11px] font-semibold text-muted-foreground'>
              {bar.isToday ? 'Today' : bar.label}
            </p>
            <p className='text-center text-[11px] text-foreground'>{bar.minutes}m</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressCharts({ plan, stats, todaysTasks, carryOverTasks, upcomingTasks }: Props) {
  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <Card className='border-border/70 bg-gradient-to-br from-card/95 via-card/80 to-violet-500/5'>
        <CardHeader className='pb-1'>
          <CardTitle className='text-base text-foreground'>Plan Progress</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 pt-2'>
          <DaysTimeline plan={plan} />
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Study Streak</span>
              <span className='font-semibold text-foreground'>
                {stats.streak} day{stats.streak !== 1 ? 's' : ''}
              </span>
            </div>
            <div className='flex gap-1'>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 flex-1 rounded ${i < Math.min(stats.streak, 7) ? 'bg-cyan-500' : 'bg-border/50'}`}
                />
              ))}
            </div>
            <p className='text-right text-xs text-muted-foreground'>Last 7 days</p>
          </div>
        </CardContent>
      </Card>

      <Card className='border-border/70 bg-gradient-to-br from-card/95 via-card/80 to-cyan-500/5'>
        <CardHeader className='pb-1'>
          <CardTitle className='text-base text-foreground'>Weekly Workload Forecast</CardTitle>
        </CardHeader>
        <CardContent className='pt-2'>
          <WeeklyLoadBars
            todaysTasks={todaysTasks}
            carryOverTasks={carryOverTasks}
            upcomingTasks={upcomingTasks}
          />
        </CardContent>
      </Card>
    </div>
  );
}
