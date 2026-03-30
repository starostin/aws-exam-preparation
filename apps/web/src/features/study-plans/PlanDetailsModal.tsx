'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { StudyMaterialItem, StudyPlanTemplate } from '@/lib/api/study-plans';

export interface GeneratedPlanWeeklyDetails {
  weekNumber: number;
  startDate: string;
  endDate: string;
  description: string;
  flashcards: number;
  quizzes: number;
  mockExams: number;
}

export interface GeneratedPlanDetailsSummary {
  totals: {
    flashcards: number;
    quizzes: number;
    mockExams: number;
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateRange(start: string, end: string): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const from = new Date(start + 'T00:00:00').toLocaleDateString('en-US', options);
  const to = new Date(end + 'T00:00:00').toLocaleDateString('en-US', options);
  return `${from} - ${to}`;
}

export function PlanDetailsModal({ template, materials, detailsSummary, open, onOpenChange }: PlanDetailsModalProps) {
  if (!template && !detailsSummary) return null;

  const materialById = new Map(materials.map((m) => [m.id, m]));

  function getWeekMaterials(weekNumber: number): Array<{ id: string; title: string; type: string; url: string | null; isFree: boolean | null }> {
    if (!template) return [];

    const byWeek = template.phases
      .filter((phase) => phase.weekNumbers.includes(weekNumber))
      .flatMap((phase) => phase.resources);

    const seen = new Set<string>();
    const unique = byWeek.filter((resource) => {
      if (seen.has(resource.id)) return false;
      seen.add(resource.id);
      return true;
    });

    return unique.map((resource) => {
      const full = materialById.get(resource.id);
      return full ?? { id: resource.id, title: resource.title, type: resource.type, url: null, isFree: null };
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{detailsSummary ? 'Plan Details' : template?.name}</DialogTitle>
          <DialogDescription>
            {detailsSummary
              ? 'Weekly learning summary with flashcard, quiz, and mock exam counts.'
              : (template?.description ?? '')}
          </DialogDescription>
        </DialogHeader>

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
                {detailsSummary.totals.mockExams} mock exams
              </Badge>
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground'>Week-by-Week Breakdown</h3>

              <div className='space-y-3'>
                {detailsSummary.weeksSummary.map((week) => {
                  const weekMaterials = getWeekMaterials(week.weekNumber);
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
                        <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-300'>{week.mockExams} mock exams</Badge>
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

        {!detailsSummary && template && (
          <>
            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge variant='outline'>{template.recommendedWeeks} weeks</Badge>
              <Badge variant='outline'>{template.recommendedDailyHours}h/day</Badge>
              <Badge variant='outline'>{template.totalHours}h total</Badge>
              <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>{template.targetAudience}</Badge>
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground'>Week-by-Week Breakdown</h3>

              <div className='space-y-3'>
                {template.phases.map((phase) => {
                  const startWeek = phase.weekNumbers[0] ?? 1;
                  const endWeek = phase.weekNumbers[phase.weekNumbers.length - 1] ?? startWeek;
                  const weekLabel = startWeek === endWeek ? `Week ${startWeek}` : `Weeks ${startWeek}–${endWeek}`;

                  const phaseMaterials = phase.resources.map((r) => {
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

                      {phaseMaterials.length === 0 && (
                        <p className='text-sm text-muted-foreground'>No specific materials assigned to this phase.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
