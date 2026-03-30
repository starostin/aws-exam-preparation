'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { StudyMaterialItem, StudyPlanTemplate } from '@/lib/api/study-plans';

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
}

function formatDateRange(start: string, end: string): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const from = new Date(start + 'T00:00:00').toLocaleDateString('en-US', options);
  const to = new Date(end + 'T00:00:00').toLocaleDateString('en-US', options);
  return `${from} - ${to}`;
}

export function PlanDetailsModal({ template, materials, detailsSummary, isLoadingPreview, open, onOpenChange }: PlanDetailsModalProps) {
  if (!template && !detailsSummary) return null;

  const materialById = new Map(materials.map((m) => [m.id, m]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{template?.name ?? 'Plan Details'}</DialogTitle>
          <DialogDescription>
            {template?.description ?? 'Weekly learning summary with flashcard, quiz, and mock exam counts.'}
          </DialogDescription>
        </DialogHeader>

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
