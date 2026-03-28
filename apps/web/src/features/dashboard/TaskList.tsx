'use client';

import { CheckCircle2, Clock, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchQuizQuestions, submitQuizAttempt } from '@/lib/api/quizzes';
import { updateTaskStatus } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StudyMaterialItem } from '@/lib/api/study-plans';
import type { QuizQuestionItem, StudyTaskItem, SubmitQuizAttemptResponse, TaskStatus, UpdateTaskStatusInput } from '@aws-exam-prep/types';

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
  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const [quizSummaries, setQuizSummaries] = useState<Record<string, { correct: number; total: number }>>({});
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

  async function handleQuizStarted(task: StudyTaskItem): Promise<void> {
    setUpdating((prev) => new Set(prev).add(task.id));
    try {
      if (task.status !== 'in_progress') {
        await updateTaskStatus(task.id, { status: 'in_progress' }, token);
        onStatusChanged(task.id, 'in_progress');
      }
      setActiveQuizTaskId(task.id);
    } catch {
      // Keep behavior consistent with manual toggles: ignore API failure and keep current UI state.
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  async function handleQuizCancelled(taskId: string): Promise<void> {
    setUpdating((prev) => new Set(prev).add(taskId));
    try {
      await updateTaskStatus(taskId, { status: 'pending' }, token);
      onStatusChanged(taskId, 'pending');
    } catch {
      // Keep behavior consistent with manual toggles: ignore API failure and keep current UI state.
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setActiveQuizTaskId((prev) => (prev === taskId ? null : prev));
    }
  }

  function handleQuizFinished(taskId: string, summary: { correct: number; total: number }): void {
    setQuizSummaries((prev) => ({ ...prev, [taskId]: summary }));
    setActiveQuizTaskId((prev) => (prev === taskId ? null : prev));
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
                token={token}
                isUpdating={updating.has(task.id)}
                onToggle={() => { void handleToggle(task); }}
                onStatusChanged={onStatusChanged}
                isQuizActive={activeQuizTaskId === task.id}
                isAnotherQuizActive={activeQuizTaskId !== null && activeQuizTaskId !== task.id}
                onQuizStarted={handleQuizStarted}
                onQuizCancelled={handleQuizCancelled}
                onQuizFinished={handleQuizFinished}
                quizSummary={quizSummaries[task.id]}
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
                token={token}
                isUpdating={updating.has(task.id)}
                onToggle={() => { void handleToggle(task); }}
                onStatusChanged={onStatusChanged}
                isQuizActive={activeQuizTaskId === task.id}
                isAnotherQuizActive={activeQuizTaskId !== null && activeQuizTaskId !== task.id}
                onQuizStarted={handleQuizStarted}
                onQuizCancelled={handleQuizCancelled}
                onQuizFinished={handleQuizFinished}
                quizSummary={quizSummaries[task.id]}
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
  token,
  isUpdating,
  onToggle,
  onStatusChanged,
  isQuizActive,
  isAnotherQuizActive,
  onQuizStarted,
  onQuizCancelled,
  onQuizFinished,
  quizSummary,
}: {
  task: StudyTaskItem;
  material: StudyMaterialItem | undefined;
  token: string;
  isUpdating: boolean;
  onToggle: () => void;
  onStatusChanged: (taskId: string, newStatus: TaskStatus) => void;
  isQuizActive: boolean;
  isAnotherQuizActive: boolean;
  onQuizStarted: (task: StudyTaskItem) => Promise<void>;
  onQuizCancelled: (taskId: string) => Promise<void>;
  onQuizFinished: (taskId: string, summary: { correct: number; total: number }) => void;
  quizSummary: { correct: number; total: number } | undefined;
}) {
  const isComingSoon = task.type === 'flashcard' || task.type === 'mock_exam';
  const typeColorClass = TYPE_COLORS[task.type] ?? 'bg-muted text-muted-foreground';
  const isQuizTask = task.type === 'quiz';
  const canStartQuiz = !isAnotherQuizActive && !isUpdating;
  const canCancelQuiz = isQuizActive && !isUpdating;
  const accuracy = quizSummary && quizSummary.total > 0
    ? Math.round((quizSummary.correct / quizSummary.total) * 100)
    : null;

  return (
    <div className='space-y-2 rounded-lg border border-border/70 bg-card/75 p-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-foreground'>{TYPE_LABELS[task.type] ?? task.type}</span>
          {(task.title ?? task.topicTitle) && (
            <span className='max-w-full truncate text-sm text-muted-foreground'>{task.title ?? task.topicTitle}</span>
          )}

          <Badge className={cn('shrink-0 text-xs', typeColorClass)}>
            {TYPE_BADGE_LABELS[task.type] ?? task.type}
          </Badge>

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
          {isQuizTask && accuracy !== null && (
            <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>
              Last quiz: {quizSummary!.correct}/{quizSummary!.total} ({accuracy}%)
            </Badge>
          )}
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          {isComingSoon ? (
            <span className='text-xs italic text-muted-foreground'>Coming soon</span>
          ) : isQuizTask ? (
            <Button
              type='button'
              size='sm'
              disabled={isQuizActive ? !canCancelQuiz : !canStartQuiz}
              onClick={() => {
                if (isQuizActive) {
                  void onQuizCancelled(task.id);
                  return;
                }
                void onQuizStarted(task);
              }}
              className='bg-violet-500 text-white hover:bg-violet-400'
            >
              {isQuizActive ? 'Cancel Quiz' : quizSummary ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
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

      {isQuizTask && isQuizActive && (
        <InlineTaskQuiz
          task={task}
          token={token}
          onStatusChanged={onStatusChanged}
          onFinished={(summary) => { onQuizFinished(task.id, summary); }}
        />
      )}
    </div>
  );
}

function InlineTaskQuiz({
  task,
  token,
  onStatusChanged,
  onFinished,
}: {
  task: StudyTaskItem;
  token: string;
  onStatusChanged: (taskId: string, newStatus: TaskStatus) => void;
  onFinished: (summary: { correct: number; total: number }) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SubmitQuizAttemptResponse | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentQuestion = questions[currentIndex] ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const questionSet = await fetchQuizQuestions(token, {
          mode: task.topicId ? 'topic' : 'mixed',
          ...(task.topicId ? { topicId: task.topicId } : {}),
          limit: 5,
        });

        if (!isMounted) return;

        if (questionSet.length === 0) {
          setError('No quiz questions found for this task yet.');
          setQuestions([]);
          return;
        }

        setQuestions(questionSet);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setFeedback(null);
        setCorrectCount(0);
        setAnsweredCount(0);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load quiz.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadQuiz();
    return () => {
      isMounted = false;
    };
  }, [task.topicId, token]);

  async function handleSubmitAnswer(): Promise<void> {
    if (!currentQuestion || !selectedOptionId || feedback) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitQuizAttempt(token, {
        questionId: currentQuestion.id,
        selectedOptionId,
      });
      setFeedback(result);
      setAnsweredCount((count) => count + 1);
      if (result.isCorrect) {
        setCorrectCount((count) => count + 1);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNext(): Promise<void> {
    if (!feedback) return;

    const isLastQuestion = currentIndex >= questions.length - 1;
    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
      setSelectedOptionId(null);
      setFeedback(null);
      return;
    }

    setIsCompletingTask(true);
    try {
      if (task.status !== 'completed') {
        await updateTaskStatus(task.id, { status: 'completed' }, token);
        onStatusChanged(task.id, 'completed');
      }
      onFinished({ correct: correctCount, total: answeredCount });
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : 'Quiz finished, but failed to mark task completed.');
    } finally {
      setIsCompletingTask(false);
    }
  }

  if (isLoading) {
    return <p className='rounded-md border border-border/70 bg-background/50 px-3 py-2 text-sm text-muted-foreground'>Loading quiz...</p>;
  }

  if (error && !currentQuestion) {
    return <p className='rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>{error}</p>;
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className='space-y-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3'>
      <p className='text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300'>
        Quiz in task row · Question {currentIndex + 1} of {questions.length}
      </p>
      <p className='text-sm font-medium text-foreground'>{currentQuestion.text}</p>

      <div className='space-y-2'>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type='button'
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-left text-sm transition',
                isSelected
                  ? 'border-violet-500/60 bg-violet-500/10 text-foreground'
                  : 'border-border/70 bg-background/80 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              )}
              onClick={() => { setSelectedOptionId(option.id); }}
              disabled={!!feedback || isCompletingTask}
            >
              {option.id.toUpperCase()}. {option.text}
            </button>
          );
        })}
      </div>

      {error && <p className='text-xs text-destructive'>{error}</p>}

      {!feedback ? (
        <div className='flex justify-end'>
          <Button
            type='button'
            onClick={() => { void handleSubmitAnswer(); }}
            disabled={!selectedOptionId || isSubmitting || isCompletingTask}
            className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'
          >
            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
            Submit Answer
          </Button>
        </div>
      ) : (
        <div className='space-y-2 rounded-md border border-border/70 bg-background/70 p-3'>
          <p className={cn('text-sm font-medium', feedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            {feedback.isCorrect ? 'Correct answer' : `Incorrect. Correct option: ${feedback.correctOptionId.toUpperCase()}`}
          </p>
          <p className='text-sm text-muted-foreground'>{feedback.explanation}</p>
          <Button
            type='button'
            onClick={() => { void handleNext(); }}
            disabled={isCompletingTask}
            className='bg-violet-500 text-white hover:bg-violet-400'
          >
            {isCompletingTask ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
            {currentIndex >= questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}
