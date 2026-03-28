'use client';

import { CheckCircle2, Clock, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { updateTaskStatus } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StudyMaterialItem } from '@/lib/api/study-plans';
import type { StudyTaskItem, TaskStatus, UpdateTaskStatusInput } from '@aws-exam-prep/types';

interface Props {
  todaysTasks: StudyTaskItem[];
  carryOverTasks: StudyTaskItem[];
  token: string;
  materials?: StudyMaterialItem[];
  onStatusChanged: (taskId: string, newStatus: TaskStatus) => void;
}

const TYPE_LABELS: Record<string, string> = {
  read: '📖 Read',
  quiz: '✏️ Quiz',
  flashcard: '🃏 Flashcard',
  mock_exam: '📋 Mock Exam',
  review: '🔁 Review',
  course: '🎓 Course',
  video: '🎬 Video',
};

const TYPE_BADGE_LABELS: Record<string, string> = {
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

const STATUS_NEXT: Record<string, UpdateTaskStatusInput['status']> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
  carried_over: 'in_progress',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Start',
  in_progress: 'Complete',
  completed: 'Reset',
  carried_over: 'Start',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'border-border/60 text-muted-foreground',
  in_progress: 'border-amber-500/60 text-amber-700 dark:text-amber-400',
  completed: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-400',
  carried_over: 'border-rose-500/60 text-rose-700 dark:text-rose-400',
};

const STATUS_ICONS: Record<string, React.FC<{ className?: string }>> = {
  pending: Clock,
  in_progress: Loader2,
  completed: CheckCircle2,
  carried_over: RotateCcw,
};

export function TaskList({ todaysTasks, carryOverTasks, token, materials = [], onStatusChanged }: Props) {
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const materialById = new Map<string, StudyMaterialItem>(materials.map((m) => [m.id, m] as [string, StudyMaterialItem]));

  async function handleToggle(task: StudyTaskItem): Promise<void> {
    const nextStatus = STATUS_NEXT[task.status];
    if (!nextStatus) return;

    setUpdating((prev) => new Set(prev).add(task.id));
    try {
      await updateTaskStatus(task.id, { status: nextStatus }, token);
      onStatusChanged(task.id, nextStatus);
    } catch {
      // Silently ignore; the UI won't update if the call fails
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  const hasTasks = todaysTasks.length > 0 || carryOverTasks.length > 0;
  const allDone =
    hasTasks &&
    [...todaysTasks, ...carryOverTasks].every((t) => t.status === 'completed');
  const totalMinutes = [...todaysTasks, ...carryOverTasks].reduce((sum, t) => sum + t.estimatedMinutes, 0);

  function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  if (!hasTasks) {
    return (
      <div className='rounded-lg border border-border/70 bg-card/75 p-6 text-center text-sm text-muted-foreground'>
        <p>No tasks scheduled for today. Check back tomorrow or pull tasks from upcoming days.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {hasTasks && (
        <p className='text-xs text-muted-foreground'>
          {[...todaysTasks, ...carryOverTasks].length} task{[...todaysTasks, ...carryOverTasks].length !== 1 ? 's' : ''}
          {' · '}
          <span className='font-medium text-foreground'>{formatMinutes(totalMinutes)}</span>
          {' total study time'}
        </p>
      )}
      {allDone && <DayCompleteAnimation />}
      {carryOverTasks.length > 0 && (
        <div className='space-y-2'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300'>Carried Over</p>
          {carryOverTasks.map((task) => {
            const rid = task.externalResourceId;
            const material = rid ? materialById.get(rid) : undefined;
            return (
              <TaskRow
                key={task.id}
                task={task}
                material={material}
                isUpdating={updating.has(task.id)}
                onToggle={() => { void handleToggle(task); }}
              />
            );
          })}
        </div>
      )}

      {todaysTasks.length > 0 && (
        <div className='space-y-2'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200'>Today&apos;s Tasks</p>
          {todaysTasks.map((task) => {
            const rid = task.externalResourceId;
            const material = rid ? materialById.get(rid) : undefined;
            return (
              <TaskRow
                key={task.id}
                task={task}
                material={material}
                isUpdating={updating.has(task.id)}
                onToggle={() => { void handleToggle(task); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

const PARTICLE_CONFIG = [
  { left: '5%', delay: '0s', color: '#06b6d4', size: 10 },
  { left: '14%', delay: '0.18s', color: '#a855f7', size: 7 },
  { left: '24%', delay: '0.32s', color: '#22c55e', size: 9 },
  { left: '34%', delay: '0.07s', color: '#f59e0b', size: 6 },
  { left: '44%', delay: '0.22s', color: '#ec4899', size: 8 },
  { left: '54%', delay: '0.14s', color: '#3b82f6', size: 7 },
  { left: '64%', delay: '0.38s', color: '#06b6d4', size: 9 },
  { left: '74%', delay: '0.05s', color: '#a855f7', size: 6 },
  { left: '83%', delay: '0.28s', color: '#22c55e', size: 8 },
  { left: '92%', delay: '0.12s', color: '#f59e0b', size: 7 },
  { left: '10%', delay: '0.45s', color: '#ec4899', size: 5 },
  { left: '50%', delay: '0.42s', color: '#3b82f6', size: 5 },
];

function DayCompleteAnimation() {
  return (
    <div className='animate-pop-in relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-violet-500/10 px-6 py-8 text-center'>
      {PARTICLE_CONFIG.map((p, i) => (
        <span
          key={i}
          className='animate-confetti-rise pointer-events-none absolute bottom-2 rounded-full'
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: `${1.1 + (i % 4) * 0.22}s`,
          }}
        />
      ))}
      <div className='animate-trophy-bounce mb-3 text-5xl'>🏆</div>
      <p className='text-lg font-semibold text-foreground'>All done for today!</p>
      <p className='mt-1 text-sm text-muted-foreground'>
        Amazing work — you crushed every task. Rest up and come back tomorrow!
      </p>
    </div>
  );
}

function TaskRow({
  task,
  material,
  isUpdating,
  onToggle,
}: {
  task: StudyTaskItem;
  material: StudyMaterialItem | undefined;
  isUpdating: boolean;
  onToggle: () => void;
}) {
  const isComingSoon = task.type === 'quiz' || task.type === 'flashcard' || task.type === 'mock_exam';
  const typeColorClass = TYPE_COLORS[task.type] ?? 'bg-muted text-muted-foreground';

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/75 p-3'>
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
        <span className='text-sm font-semibold text-foreground'>{TYPE_LABELS[task.type] ?? task.type}</span>
        {(task.title ?? task.topicTitle) && (
          <span className='max-w-full truncate text-sm text-muted-foreground'>{task.title ?? task.topicTitle}</span>
        )}

        {/* Type tag */}
        <Badge className={cn('shrink-0 text-xs', typeColorClass)}>
          {TYPE_BADGE_LABELS[task.type] ?? task.type}
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

        {(() => {
          const StatusIcon = STATUS_ICONS[task.status] ?? Clock;
          return (
            <Badge variant='outline' className={cn('shrink-0 gap-1 text-xs', STATUS_BADGE[task.status])}>
              <StatusIcon className='h-3 w-3' />
              {task.status.replace(/_/g, ' ')}
            </Badge>
          );
        })()}
        <span className='text-xs text-muted-foreground'>{task.estimatedMinutes} min</span>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        {isComingSoon ? (
          <span className='text-xs italic text-muted-foreground'>Coming soon</span>
        ) : (
          <Button
            type='button'
            disabled={isUpdating}
            onClick={onToggle}
            size='sm'
            className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'
          >
            {isUpdating ? '…' : STATUS_LABELS[task.status]}
          </Button>
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
}
