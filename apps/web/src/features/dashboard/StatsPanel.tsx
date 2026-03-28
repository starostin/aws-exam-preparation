import { Card, CardContent } from '@/components/ui/card';
import type { DashboardStats, DashboardStudyPlan } from '@aws-exam-prep/types';

interface Props {
  plan: DashboardStudyPlan;
  stats: DashboardStats;
}

export function StatsPanel({ plan, stats }: Props) {
  const daysUntilExam = Math.ceil(
    (new Date(plan.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const topicsPercent =
    stats.totalTopics > 0
      ? Math.round((stats.topicsCompleted / stats.totalTopics) * 100)
      : 0;

  const readinessLabel =
    stats.readinessScore != null ? `${Math.round(stats.readinessScore)}%` : '—';

  const accuracyLabel =
    stats.quizAccuracy != null ? `${Math.round(stats.quizAccuracy * 100)}%` : '—';

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5'>
      <StatCard
        label='Streak'
        value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`}
        sub='consecutive study days'
        accent='text-cyan-700 dark:text-cyan-200'
      />
      <StatCard
        label='Topics'
        value={`${stats.topicsCompleted} / ${stats.totalTopics}`}
        sub={`${topicsPercent}% complete`}
        accent='text-sky-700 dark:text-sky-300'
      />
      <StatCard
        label='Readiness'
        value={readinessLabel}
        sub='overall score'
        accent='text-emerald-700 dark:text-emerald-300'
      />
      <StatCard
        label='Quiz Accuracy'
        value={accuracyLabel}
        sub='all-time average'
        accent='text-violet-700 dark:text-violet-300'
      />
      <StatCard
        label='Days to Exam'
        value={daysUntilExam > 0 ? String(daysUntilExam) : 'Today!'}
        sub={plan.certificationCode}
        accent='text-amber-700 dark:text-amber-300'
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <Card className='border-border/70 bg-card/80'>
      <CardContent className='space-y-1 p-4'>
        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>{label}</p>
        <p className={`text-3xl font-semibold ${accent}`}>{value}</p>
        <p className='text-xs text-muted-foreground'>{sub}</p>
      </CardContent>
    </Card>
  );
}
