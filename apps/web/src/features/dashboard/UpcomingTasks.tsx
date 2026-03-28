import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { UpcomingDay } from '@aws-exam-prep/types';

interface Props {
  upcomingTasks: UpcomingDay[];
  showAll?: boolean;
  token?: string;
  onMoveToToday?: (taskId: string) => Promise<void>;
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function UpcomingTasks({ upcomingTasks, showAll = false, token, onMoveToToday }: Props) {
  const [expanded, setExpanded] = useState(showAll);
  const [moving, setMoving] = useState<Set<string>>(new Set());

  async function handleMoveToToday(taskId: string): Promise<void> {
    if (!onMoveToToday) return;
    setMoving((prev) => new Set(prev).add(taskId));
    try {
      await onMoveToToday(taskId);
    } finally {
      setMoving((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }

  if (upcomingTasks.length === 0) {
    return (
      <p className='text-sm italic text-muted-foreground'>
        No upcoming tasks scheduled yet. Tasks for future days will appear here once generated.
      </p>
    );
  }

  const shown = expanded ? upcomingTasks : upcomingTasks.slice(0, 3);
  const totalTasks = upcomingTasks.reduce((sum, d) => sum + d.tasks.length, 0);

  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted-foreground'>
        {totalTasks} task{totalTasks !== 1 ? 's' : ''} across {upcomingTasks.length} day{upcomingTasks.length !== 1 ? 's' : ''}
      </p>

      {shown.map((day) => (
        <div key={day.date} className='rounded-lg border border-border/70 bg-card/75 p-3'>
          <p className='mb-2 text-sm font-semibold text-foreground'>{formatDate(day.date)}</p>
          <div className='space-y-1.5'>
            {day.tasks.map((task) => (
              <div
                key={task.id}
                className='flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-secondary/60 px-2.5 py-1.5 text-xs'
              >
                <span className='flex items-center gap-1 text-secondary-foreground'>
                  <span>{TYPE_LABELS[task.type] ?? task.type}</span>
                  {(task.title ?? task.topicTitle) && (
                    <span className='text-muted-foreground'>— {task.title ?? task.topicTitle}</span>
                  )}
                  <span className='text-muted-foreground'>{task.estimatedMinutes}m</span>
                </span>
                {onMoveToToday && (
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    disabled={moving.has(task.id)}
                    onClick={() => { void handleMoveToToday(task.id); }}
                    className='h-6 border-cyan-500/40 px-2 text-xs text-cyan-700 hover:border-cyan-400 hover:bg-cyan-500/10 dark:text-cyan-300'
                  >
                    {moving.has(task.id) ? '…' : 'Move to Today'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {upcomingTasks.length > 3 && (
        <Button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          variant='ghost'
          className='w-fit px-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200'
        >
          {expanded ? 'Show less' : `Show ${upcomingTasks.length - 3} more days`}
        </Button>
      )}
    </div>
  );
}
