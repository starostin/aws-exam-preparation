import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats, DashboardStudyPlan } from '@aws-exam-prep/types';

interface Props {
  plan: DashboardStudyPlan;
  stats: DashboardStats;
}

const CIRCUMFERENCE = 2 * Math.PI * 45; // r=45

function RingChart({
  percent,
  label,
  value,
  color,
}: {
  percent: number;
  label: string;
  value: string;
  color: string;
}) {
  const offset = CIRCUMFERENCE * (1 - Math.min(percent, 100) / 100);

  return (
    <div className='flex flex-col items-center gap-3'>
      <svg width='120' height='120' viewBox='0 0 100 100' className='-rotate-90'>
        {/* track */}
        <circle
          cx='50'
          cy='50'
          r='45'
          fill='none'
          stroke='currentColor'
          strokeWidth='8'
          className='text-border/60'
        />
        {/* progress */}
        <circle
          cx='50'
          cy='50'
          r='45'
          fill='none'
          stroke='currentColor'
          strokeWidth='8'
          strokeLinecap='round'
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={color}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className='-mt-[88px] flex h-[120px] flex-col items-center justify-center text-center'>
        <span className='text-2xl font-semibold text-foreground'>{value}</span>
        <span className='mt-0.5 text-xs text-muted-foreground'>{label}</span>
      </div>
    </div>
  );
}

function TopicsBar({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className='space-y-2'>
      <div className='flex justify-between text-sm'>
        <span className='text-muted-foreground'>Topics Completed</span>
        <span className='font-semibold text-foreground'>
          {completed} / {total}
        </span>
      </div>
      <div className='h-2.5 w-full overflow-hidden rounded-full bg-border/50'>
        <div
          className='h-full rounded-full bg-sky-500 transition-all duration-700'
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className='text-right text-xs text-muted-foreground'>{percent}% complete</p>
    </div>
  );
}

function DaysTimeline({ plan }: { plan: DashboardStudyPlan }) {
  const today = Date.now();
  const targetMs = new Date(plan.targetDate + 'T00:00:00').getTime();
  const daysLeft = Math.max(0, Math.ceil((targetMs - today) / (1000 * 60 * 60 * 24)));

  let progressPercent = 0;
  // We'll show how close we are to the exam (days elapsed / total days assumed from plan creation)
  // Since we don't have plan created date, just show days remaining visually
  const totalDaysEstimate = 90; // rough estimate for display only
  const elapsed = Math.max(0, totalDaysEstimate - daysLeft);
  progressPercent = Math.min(100, Math.round((elapsed / totalDaysEstimate) * 100));

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
          className='h-full rounded-full bg-amber-500 transition-all duration-700'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className='text-right text-xs text-muted-foreground'>
        Exam: {new Date(plan.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

export function ProgressCharts({ plan, stats }: Props) {
  const topicsPercent =
    stats.totalTopics > 0 ? Math.round((stats.topicsCompleted / stats.totalTopics) * 100) : 0;
  const readinessPercent = stats.readinessScore != null ? Math.round(stats.readinessScore) : 0;
  const accuracyPercent =
    stats.quizAccuracy != null ? Math.round(stats.quizAccuracy * 100) : 0;

  return (
    <div className='grid gap-5 xl:grid-cols-[1fr_1fr]'>
      {/* Ring charts */}
      <Card className='border-border/70 bg-card/70'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base text-foreground'>Readiness Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap justify-around gap-6 py-2'>
            <RingChart
              percent={readinessPercent}
              label='Readiness Score'
              value={stats.readinessScore != null ? `${readinessPercent}%` : '—'}
              color='text-emerald-500'
            />
            <RingChart
              percent={topicsPercent}
              label='Topics Done'
              value={`${topicsPercent}%`}
              color='text-sky-500'
            />
            <RingChart
              percent={accuracyPercent}
              label='Quiz Accuracy'
              value={stats.quizAccuracy != null ? `${accuracyPercent}%` : '—'}
              color='text-violet-500'
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress bars */}
      <Card className='border-border/70 bg-card/70'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base text-foreground'>Plan Progress</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 pt-2'>
          <TopicsBar completed={stats.topicsCompleted} total={stats.totalTopics} />
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
    </div>
  );
}
