import { Card, CardContent } from '@/components/ui/card';
import type { DashboardStats } from '@aws-exam-prep/types';

interface Props {
  stats: DashboardStats;
  quizzesPassedTotal: number;
  flashcardsStudiedTotal: number;
}

export function StatsPanel({ stats, quizzesPassedTotal, flashcardsStudiedTotal }: Props) {
  const topicsPercent =
    stats.totalTopics > 0
      ? Math.round((stats.topicsCompleted / stats.totalTopics) * 100)
      : 0;

  const readinessLabel =
    stats.readinessScore != null ? `${Math.round(stats.readinessScore)}%` : '—';

  const accuracyLabel =
    stats.quizAccuracy != null ? `${Math.round(stats.quizAccuracy * 100)}%` : '—';

  const cards: Array<{
    label: string;
    value: string;
    sub: string;
    accent: string;
    glow: string;
  }> = [
    {
      label: 'Streak',
      value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
      sub: 'consecutive study days',
      accent: 'text-cyan-700 dark:text-cyan-200',
      glow: 'from-cyan-500/18 to-transparent',
    },
    {
      label: 'Topics',
      value: `${stats.topicsCompleted} / ${stats.totalTopics}`,
      sub: `${topicsPercent}% complete`,
      accent: 'text-sky-700 dark:text-sky-300',
      glow: 'from-sky-500/18 to-transparent',
    },
    {
      label: 'Readiness',
      value: readinessLabel,
      sub: 'overall score',
      accent: 'text-emerald-700 dark:text-emerald-300',
      glow: 'from-emerald-500/18 to-transparent',
    },
    {
      label: 'Quiz Accuracy',
      value: accuracyLabel,
      sub: `${quizzesPassedTotal} quizzes passed`,
      accent: 'text-violet-700 dark:text-violet-300',
      glow: 'from-violet-500/18 to-transparent',
    },
    {
      label: 'Flashcards Studied',
      value: String(flashcardsStudiedTotal),
      sub: 'total reviewed cards',
      accent: 'text-teal-700 dark:text-teal-300',
      glow: 'from-teal-500/18 to-transparent',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
      {cards.map((card, index) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          sub={card.sub}
          accent={card.accent}
          glow={card.glow}
          delay={index}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  glow,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  glow: string;
  delay: number;
}) {
  return (
    <Card
      className='group relative overflow-hidden border-border/70 bg-card/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-card/95 hover:shadow-[0_18px_34px_-20px_rgba(6,182,212,0.45)] animate-rise-in'
      style={{ animationDelay: `${Math.min(0.45, delay * 0.05)}s` }}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b ${glow}`} />
      <CardContent className='relative space-y-1 p-3'>
        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>{label}</p>
        <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
        <p className='text-xs text-muted-foreground'>{sub}</p>
      </CardContent>
    </Card>
  );
}
