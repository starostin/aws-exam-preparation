'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { StudyMaterialItem, StudyPlanTemplate } from '@/lib/api/study-plans';
import type { StudyTaskItem, WeekSchedule } from '@aws-exam-prep/types';

export interface GeneratedWeekMaterialItem {
  externalResourceId: string;
  title: string;
  type: string;
}

export interface GeneratedPlanWeeklyDetails {
  weekNumber: number;
  startDate: string;
  endDate: string;
  description: string;
  flashcards: number;
  quizzes: number;
  mockExams: number;
  practiceTests: number;
  materials: GeneratedWeekMaterialItem[];
}

export interface GeneratedPlanDetailsSummary {
  totals: {
    flashcards: number;
    quizzes: number;
    mockExams: number;
    practiceTests: number;
  };
  weeksSummary: GeneratedPlanWeeklyDetails[];
}

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  course: 'Course',
  video: 'Video',
  docs: 'Docs',
  practice_test: 'Practice Test',
};

export const MATERIAL_TYPE_COLORS: Record<string, string> = {
  course: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  video: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  docs: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  practice_test: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

export interface PlanDetailsModalProps {
  template: StudyPlanTemplate | null;
  materials: StudyMaterialItem[];
  detailsSummary?: GeneratedPlanDetailsSummary | null;
  isLoadingPreview?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleWeeks?: WeekSchedule[];
}

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

function fmtDateRangePrompt(start: string, end: string): string {
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
    lines.push(`## Week ${week.weekNumber} (${fmtDateRangePrompt(week.startDate, week.endDate)}) — ${fmtMin(weekMin)} total`);
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

function buildPreviewPrompt(
  template: StudyPlanTemplate,
  materials: StudyMaterialItem[],
  detailsSummary: GeneratedPlanDetailsSummary | null | undefined,
): string {
  const materialById = new Map(materials.map((m) => [m.id, m]));

  const lines: string[] = [
    '# AWS Certification Study Plan – AI Validation Request',
    '',
    `Please review the following study plan for the **AWS certification** and provide feedback on:`,
    '- Coverage of exam domains and topics',
    '- Pacing and time allocation per phase',
    '- Quality and relevance of selected materials',
    '- Any gaps or improvements you recommend',
    '',
    '---',
    '',
    `## Plan: ${template.name}`,
    `**Description**: ${template.description}`,
    `**Target Audience**: ${template.targetAudience}`,
    `**Duration**: ${template.recommendedWeeks} weeks`,
    `**Daily Commitment**: ${template.recommendedDailyHours} hours/day`,
    `**Total Hours**: ${template.totalHours} hours`,
    `**Tagline**: ${template.tagline}`,
    '',
  ];

  if (detailsSummary && detailsSummary.weeksSummary.length > 0) {
    lines.push('## Week-by-Week Breakdown', '');

    lines.push(
      `**Totals**: ${detailsSummary.totals.flashcards} flashcards, ` +
        `${detailsSummary.totals.quizzes} quizzes, ` +
        `${detailsSummary.totals.mockExams} mock exams` +
        (detailsSummary.totals.practiceTests > 0 ? `, ${detailsSummary.totals.practiceTests} practice tests` : ''),
    );
    lines.push('');

    for (const week of detailsSummary.weeksSummary) {
      lines.push(`### Week ${week.weekNumber} (${fmtDateRangePrompt(week.startDate, week.endDate)})`);
      lines.push(week.description);
      lines.push('');

      const counts: string[] = [];
      if (week.flashcards > 0) counts.push(`${week.flashcards} flashcards`);
      if (week.quizzes > 0) counts.push(`${week.quizzes} quizzes`);
      if (week.mockExams > 0) counts.push(`${week.mockExams} mock exams`);
      if (week.practiceTests > 0) counts.push(`${week.practiceTests} practice tests`);
      if (counts.length > 0) lines.push(`Activities: ${counts.join(', ')}`);

      if (week.materials.length > 0) {
        lines.push('');
        lines.push('**Materials:**');
        for (const m of week.materials) {
          const full = materialById.get(m.externalResourceId);
          const typeLabel = MATERIAL_TYPE_LABELS[m.type] ?? m.type;
          const freeLabel = full?.isFree != null ? (full.isFree ? 'Free' : 'Paid') : '';
          const topic = full?.domainName ?? full?.topicTitle ?? '';
          lines.push(`- **${m.title}** (${typeLabel})${freeLabel ? ` – ${freeLabel}` : ''}${topic ? ` | ${topic}` : ''}`);
          if (full?.url) lines.push(`  URL: ${full.url}`);
        }
      }
      lines.push('');
    }
  } else {
    lines.push('## Phase-by-Phase Breakdown', '');

    for (const phase of template.phases) {
      const startWeek = phase.weekNumbers[0] ?? 1;
      const endWeek = phase.weekNumbers[phase.weekNumbers.length - 1] ?? startWeek;
      const weekLabel = startWeek === endWeek ? `Week ${startWeek}` : `Weeks ${startWeek}–${endWeek}`;

      lines.push(`### ${phase.name} (${weekLabel})`);
      lines.push(phase.description);

      if (phase.resources.length > 0) {
        lines.push('');
        lines.push('**Materials:**');
        for (const r of phase.resources) {
          const full = materialById.get(r.id);
          const typeLabel = MATERIAL_TYPE_LABELS[r.type] ?? r.type;
          const freeLabel = full?.isFree != null ? (full.isFree ? 'Free' : 'Paid') : '';
          const topic = full?.domainName ?? full?.topicTitle ?? '';
          lines.push(`- **${r.title}** (${typeLabel})${freeLabel ? ` – ${freeLabel}` : ''}${topic ? ` | ${topic}` : ''}`);
          if (full?.url) lines.push(`  URL: ${full.url}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function formatDateRange(start: string, end: string): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const from = new Date(start + 'T00:00:00').toLocaleDateString('en-US', options);
  const to = new Date(end + 'T00:00:00').toLocaleDateString('en-US', options);
  return `${from} - ${to}`;
}

export function PlanDetailsModal({ template, materials, detailsSummary, isLoadingPreview, open, onOpenChange, scheduleWeeks }: PlanDetailsModalProps) {
  const [promptCopied, setPromptCopied] = useState(false);

  if (!template && !detailsSummary) return null;

  const materialById = new Map(materials.map((m) => [m.id, m]));

  const hasSchedule = scheduleWeeks && scheduleWeeks.length > 0;
  const hasPreviewData = template !== null;
  const canCopyPrompt = hasSchedule || hasPreviewData;

  function handleCopyPrompt(): void {
    let text: string;
    if (hasSchedule) {
      text = buildSchedulePrompt(scheduleWeeks, materials);
    } else if (template) {
      text = buildPreviewPrompt(template, materials, detailsSummary);
    } else {
      return;
    }
    void navigator.clipboard.writeText(text).then(() => {
      setPromptCopied(true);
      setTimeout(() => { setPromptCopied(false); }, 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{template?.name ?? 'Plan Details'}</DialogTitle>
          <DialogDescription>
            {template?.description ?? 'Weekly learning summary with flashcard, quiz, and mock exam counts.'}
          </DialogDescription>
        </DialogHeader>

        {canCopyPrompt && (
          <div className='flex'>
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5 text-xs'
              onClick={handleCopyPrompt}
            >
              {promptCopied
                ? <Check className='h-3.5 w-3.5 text-emerald-500' />
                : <Copy className='h-3.5 w-3.5' />}
              {promptCopied ? 'Copied!' : 'Copy Prompt'}
            </Button>
          </div>
        )}

        {isLoadingPreview && !detailsSummary && (
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-3'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Generating schedule preview…</p>
            </div>
          </div>
        )}

        {detailsSummary && (
          <>
            <div className='mt-2 flex flex-wrap gap-2'>
              {template && <Badge variant='outline'>{template.recommendedWeeks} weeks</Badge>}
              {template && <Badge variant='outline'>{template.recommendedDailyHours}h/day</Badge>}
              {template && <Badge variant='outline'>{template.totalHours}h total</Badge>}
              {template && <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>{template.targetAudience}</Badge>}
            </div>

            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge className='bg-blue-500/15 text-blue-700 dark:text-blue-300'>
                {detailsSummary.totals.flashcards} flashcards
              </Badge>
              <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>
                {detailsSummary.totals.quizzes} quizzes
              </Badge>
              <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-300'>
                {detailsSummary.totals.mockExams} mock {detailsSummary.totals.mockExams === 1 ? 'exam' : 'exams'}
              </Badge>
              {detailsSummary.totals.practiceTests > 0 && (
                <Badge className='bg-orange-500/15 text-orange-700 dark:text-orange-300'>
                  {detailsSummary.totals.practiceTests} practice {detailsSummary.totals.practiceTests === 1 ? 'test' : 'tests'}
                </Badge>
              )}
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground'>Week-by-Week Breakdown</h3>

              <div className='space-y-3'>
                {detailsSummary.weeksSummary.map((week) => {
                  // Use materials from the server response (extracted from actual
                  // tasks) instead of the template phase lookup which can't match
                  // week numbers when the schedule is more compact than expected.
                  const weekMaterials = (week.materials ?? []).map((m) => {
                    const full = materialById.get(m.externalResourceId);
                    return full
                      ? { id: full.id, title: full.title, type: full.type, url: full.url, isFree: full.isFree }
                      : { id: m.externalResourceId, title: m.title, type: m.type, url: null, isFree: null };
                  });
                  return (
                    <div key={week.weekNumber} className='rounded-xl border border-border/70 bg-background/60 p-4 space-y-3'>
                      <div className='flex flex-wrap items-start justify-between gap-2'>
                        <div>
                          <p className='text-base font-semibold text-foreground'>Week {week.weekNumber}</p>
                          <p className='text-sm text-muted-foreground'>{week.description}</p>
                        </div>
                        <Badge variant='outline' className='shrink-0'>{formatDateRange(week.startDate, week.endDate)}</Badge>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        <Badge className='bg-blue-500/15 text-blue-700 dark:text-blue-300'>{week.flashcards} flashcards</Badge>
                        <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>{week.quizzes} quizzes</Badge>
                        {week.mockExams > 0 && (
                          <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-300'>{week.mockExams} mock {week.mockExams === 1 ? 'exam' : 'exams'}</Badge>
                        )}
                        {week.practiceTests > 0 && (
                          <Badge className='bg-orange-500/15 text-orange-700 dark:text-orange-300'>{week.practiceTests} practice {week.practiceTests === 1 ? 'test' : 'tests'}</Badge>
                        )}
                      </div>

                      {weekMaterials.length > 0 && (
                        <div className='space-y-2'>
                          <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>Materials</p>
                          <div className='grid gap-2'>
                            {weekMaterials.map((material) => {
                              const full = materialById.get(material.id);
                              const typeColorClass = MATERIAL_TYPE_COLORS[material.type] ?? 'bg-muted text-muted-foreground';
                              return (
                                <div key={material.id} className='flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2'>
                                  <div className='min-w-0'>
                                    <p className='truncate text-sm font-medium text-foreground'>{material.title}</p>
                                    {(full?.domainName ?? full?.topicTitle) ? (
                                      <p className='text-xs text-muted-foreground'>{full?.domainName ?? full?.topicTitle}</p>
                                    ) : null}
                                  </div>
                                  <div className='flex shrink-0 items-center gap-2'>
                                    <Badge className={cn('text-xs', typeColorClass)}>
                                      {MATERIAL_TYPE_LABELS[material.type] ?? material.type}
                                    </Badge>
                                    {full?.isFree !== null && full?.isFree !== undefined && (
                                      <Badge variant='outline' className='text-xs'>{full.isFree ? 'Free' : 'Paid'}</Badge>
                                    )}
                                    {full?.url && (
                                      <Button asChild size='sm' className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
                                        <a href={full.url} target='_blank' rel='noreferrer'>
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
                      )}

                      {weekMaterials.length === 0 && (
                        <p className='text-sm text-muted-foreground'>No specific materials assigned to this week.</p>
                      )}
                    </div>
                  );
                })}

                {detailsSummary.weeksSummary.length === 0 && (
                  <p className='text-sm text-muted-foreground'>No weekly details available yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        {!detailsSummary && !isLoadingPreview && template && (() => {
          // Collect unique practice tests across all phases for the totals
          const allPracticeTests = new Map<string, { id: string; title: string }>();
          for (const phase of template.phases) {
            for (const r of phase.resources) {
              if (r.type === 'practice_test') allPracticeTests.set(r.id, r);
            }
          }
          const totalPracticeTests = allPracticeTests.size;

          return (
            <>
              <div className='mt-2 flex flex-wrap gap-2'>
                <Badge variant='outline'>{template.recommendedWeeks} weeks</Badge>
                <Badge variant='outline'>{template.recommendedDailyHours}h/day</Badge>
                <Badge variant='outline'>{template.totalHours}h total</Badge>
                <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>{template.targetAudience}</Badge>
              </div>

              <div className='mt-2 flex flex-wrap gap-2'>
                <Badge className='bg-blue-500/15 text-blue-700 dark:text-blue-300'>Flashcards included</Badge>
                <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>Quizzes included</Badge>
                <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-300'>1 mock exam</Badge>
                {totalPracticeTests > 0 && (
                  <Badge className='bg-orange-500/15 text-orange-700 dark:text-orange-300'>
                    {totalPracticeTests} practice {totalPracticeTests === 1 ? 'test' : 'tests'}
                  </Badge>
                )}
              </div>

              <div className='space-y-4'>
                <h3 className='text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground'>Phase-by-Phase Breakdown</h3>

                <div className='space-y-3'>
                  {template.phases.map((phase) => {
                    const startWeek = phase.weekNumbers[0] ?? 1;
                    const endWeek = phase.weekNumbers[phase.weekNumbers.length - 1] ?? startWeek;
                    const weekLabel = startWeek === endWeek ? `Week ${startWeek}` : `Weeks ${startWeek}–${endWeek}`;

                    const practiceTests = phase.resources.filter((r) => r.type === 'practice_test');
                    const phaseMaterials = phase.resources
                      .map((r) => {
                        const full = materialById.get(r.id);
                        return full ?? { id: r.id, title: r.title, type: r.type, url: null, isFree: null };
                      });

                    return (
                      <div key={phase.name} className='rounded-xl border border-border/70 bg-background/60 p-4 space-y-3'>
                        <div className='flex flex-wrap items-start justify-between gap-2'>
                          <div>
                            <p className='text-base font-semibold text-foreground'>{phase.name}</p>
                            <p className='text-sm text-muted-foreground'>{phase.description}</p>
                          </div>
                          <Badge variant='outline' className='shrink-0'>{weekLabel}</Badge>
                        </div>

                        <div className='flex flex-wrap gap-2'>
                          {phase.focusTopicSlugs.length > 0 && (
                            <>
                              <Badge className='bg-blue-500/15 text-blue-700 dark:text-blue-300'>Flashcards</Badge>
                              <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>Quizzes</Badge>
                            </>
                          )}
                          {practiceTests.length > 0 && (
                            <Badge className='bg-orange-500/15 text-orange-700 dark:text-orange-300'>
                              {practiceTests.length} practice {practiceTests.length === 1 ? 'test' : 'tests'}
                            </Badge>
                          )}
                        </div>

                        {phaseMaterials.length > 0 && (
                          <div className='space-y-2'>
                            <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>Materials</p>
                            <div className='grid gap-2'>
                              {phaseMaterials.map((material) => {
                                const full = materialById.get(material.id);
                                const typeColorClass = MATERIAL_TYPE_COLORS[material.type] ?? 'bg-muted text-muted-foreground';
                                return (
                                  <div key={material.id} className='flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2'>
                                    <div className='min-w-0'>
                                      <p className='truncate text-sm font-medium text-foreground'>{material.title}</p>
                                      {(full?.domainName ?? full?.topicTitle) ? (
                                        <p className='text-xs text-muted-foreground'>{full?.domainName ?? full?.topicTitle}</p>
                                      ) : null}
                                    </div>
                                    <div className='flex shrink-0 items-center gap-2'>
                                      <Badge className={cn('text-xs', typeColorClass)}>
                                        {MATERIAL_TYPE_LABELS[material.type] ?? material.type}
                                      </Badge>
                                      {full?.isFree !== null && full?.isFree !== undefined && (
                                        <Badge variant='outline' className='text-xs'>{full.isFree ? 'Free' : 'Paid'}</Badge>
                                      )}
                                      {full?.url && (
                                        <Button asChild size='sm' className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
                                          <a href={full.url} target='_blank' rel='noreferrer'>
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
                        )}

                        {phaseMaterials.length === 0 && practiceTests.length === 0 && (
                          <p className='text-sm text-muted-foreground'>No specific materials assigned to this phase.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}
