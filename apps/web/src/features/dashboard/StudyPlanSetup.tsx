'use client';

import { format } from 'date-fns';
import { CheckCircle2, Clock4, Info } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { createStudyPlan, fetchStudyMaterials, fetchStudyPlanTemplates, previewSchedule } from '@/lib/api/study-plans';
import type { PreviewDetailsSummary } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PlanDetailsModal } from '@/features/study-plans/PlanDetailsModal';
import type { CertificationItem, StudyMaterialItem, StudyPlanTemplate } from '@/lib/api/study-plans';

type PlanMode = 'template' | 'custom';

function addDays(baseDate: Date, days: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

interface Props {
  certifications: CertificationItem[];
  token: string;
  onCreated: () => void;
}

const CUSTOM_WEEKS_OPTIONS = [1, 2, 3, 4, 6, 8, 10, 12] as const;
const CUSTOM_HOURS_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;

export function StudyPlanSetup({ certifications, token, onCreated }: Props) {
  const defaultCertId = certifications[0]?.id ?? '';
  const [certificationId, setCertificationId] = useState(defaultCertId);
  const [planMode, setPlanMode] = useState<PlanMode>('template');
  const [templates, setTemplates] = useState<StudyPlanTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [customWeeks, setCustomWeeks] = useState<number>(4);
  const [customHoursPerDay, setCustomHoursPerDay] = useState<number>(2);

  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsTemplate, setDetailsTemplate] = useState<StudyPlanTemplate | null>(null);
  const [previewDetails, setPreviewDetails] = useState<PreviewDetailsSummary | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const today = new Date();
  const featuredTemplates = templates.filter((t) => !/^saa-c03-\d+w-\d+h$/.test(t.slug));
  const customVariantSlug = `saa-c03-${customWeeks}w-${customHoursPerDay}h`;
  const customVariantTemplate = templates.find((t) => t.slug === customVariantSlug) ?? null;
  const targetSpanDays = Math.max(
    0,
    ((customVariantTemplate?.recommendedWeeks ?? customWeeks) * 7) - 1,
  );
  const effectiveTargetDate = addDays(today, targetSpanDays);
  const effectiveTargetDateStr = effectiveTargetDate ? format(effectiveTargetDate, 'yyyy-MM-dd') : '';

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTemplates(true);

    async function loadTemplates(): Promise<void> {
      try {
        const data = await fetchStudyPlanTemplates(token);
        if (isMounted) {
          setTemplates(data);
        }
      } catch {
        if (isMounted) setTemplatesError('Failed to load plan templates.');
      } finally {
        if (isMounted) setIsLoadingTemplates(false);
      }
    }

    void loadTemplates();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    async function loadMaterials(): Promise<void> {
      if (!certificationId) {
        if (isMounted) setMaterials([]);
        return;
      }

      try {
        const data = await fetchStudyMaterials(certificationId, token);
        if (isMounted) setMaterials(data);
      } catch {
        if (isMounted) setMaterials([]);
      }
    }

    void loadMaterials();

    return () => {
      isMounted = false;
    };
  }, [certificationId, token]);

  function resetReviewState(): void {
    setError(null);
  }

  async function handleOpenDetails(template: StudyPlanTemplate): Promise<void> {
    setDetailsTemplate(template);
    setPreviewDetails(null);
    setIsLoadingPreview(true);
    try {
      const details = await previewSchedule({
        certificationId,
        targetDate: format(addDays(new Date(), Math.max(0, template.recommendedWeeks * 7 - 1)), 'yyyy-MM-dd'),
        dailyHours: template.recommendedDailyHours,
        selectedMaterialIds: template.selectedMaterialIds,
      }, token);
      setPreviewDetails(details);
    } catch {
      // If preview fails, the modal will still show — just without the preview data
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleOpenCustomDetails(): Promise<void> {
    setDetailsTemplate(customVariantTemplate);
    setPreviewDetails(null);
    if (!certificationId || !effectiveTargetDateStr) return;
    setIsLoadingPreview(true);
    try {
      const details = await previewSchedule({
        certificationId,
        targetDate: effectiveTargetDateStr,
        dailyHours: customHoursPerDay,
      }, token);
      setPreviewDetails(details);
    } catch {
      // fallback: template view
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleAcceptTemplate(template: StudyPlanTemplate): Promise<void> {
    if (!certificationId) return;
    const targetDate = format(addDays(new Date(), Math.max(0, template.recommendedWeeks * 7 - 1)), 'yyyy-MM-dd');
    setIsSubmitting(true);
    setError(null);
    try {
      await createStudyPlan({
        certificationId,
        targetDate,
        dailyHours: template.recommendedDailyHours,
        selectedMaterialIds: template.selectedMaterialIds,
      }, token);
      window.dispatchEvent(new Event('study-plan-created'));
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study plan');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAcceptCustomVariant(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!certificationId || !effectiveTargetDateStr) return;
    // If a matching template exists, use its curated material selection;
    // otherwise submit without selectedMaterialIds so the backend picks defaults.
    if (customVariantTemplate) {
      await handleAcceptTemplate(customVariantTemplate);
    } else {
      setIsSubmitting(true);
      setError(null);
      try {
        await createStudyPlan({
          certificationId,
          targetDate: effectiveTargetDateStr,
          dailyHours: customHoursPerDay,
        }, token);
        window.dispatchEvent(new Event('study-plan-created'));
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create study plan');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <Card className='border-cyan-400/20 bg-card/75'>
      <CardHeader>
        <CardTitle className='text-2xl text-foreground'>Set Up Your Study Plan</CardTitle>
        <CardDescription className='text-muted-foreground'>
          Choose a ready-made plan or build your own.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={(e) => { void handleAcceptCustomVariant(e); }} className='space-y-6'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium text-foreground'>Certification</label>
            <Select value={certificationId} onValueChange={setCertificationId}>
              <SelectTrigger className='border-border bg-background/70 text-foreground'>
                <SelectValue placeholder='Select a certification' />
              </SelectTrigger>
              <SelectContent>
                {certifications.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-3'>
            <label className='text-sm font-medium text-foreground'>Plan Type</label>
            <div className='grid gap-3 sm:grid-cols-2'>
              <button
                type='button'
                onClick={() => {
                  resetReviewState();
                  setPlanMode('template');
                }}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  planMode === 'template'
                    ? 'border-cyan-400/60 bg-cyan-500/10'
                    : 'border-border/70 bg-background/50 hover:border-cyan-400/30 hover:bg-background/80',
                )}
              >
                <p className='text-base font-semibold text-foreground'>Use a predefined plan</p>
                <p className='mt-1 text-sm text-muted-foreground'>Start from a recommended study schedule and review it before activation.</p>
              </button>

              <button
                type='button'
                onClick={() => {
                  resetReviewState();
                  setPlanMode('custom');
                }}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  planMode === 'custom'
                    ? 'border-cyan-400/60 bg-cyan-500/10'
                    : 'border-border/70 bg-background/50 hover:border-cyan-400/30 hover:bg-background/80',
                )}
              >
                <p className='text-base font-semibold text-foreground'>Create my own</p>
                <p className='mt-1 text-sm text-muted-foreground'>Choose your own target date and daily study commitment.</p>
              </button>
            </div>
          </div>

          {planMode === 'template' ? (
            <div className='grid gap-3'>
              <label className='text-sm font-medium text-foreground'>Most Popular</label>
              <div className='grid gap-3'>
                {isLoadingTemplates ? (
                  <div className='rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground'>Loading plan templates...</div>
                ) : templatesError ? (
                  <div className='rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>{templatesError}</div>
                ) : (
                  featuredTemplates.map((template) => (
                    <div
                      key={template.slug}
                      className='rounded-xl border border-border/70 bg-background/50 p-4 text-left transition-colors hover:border-cyan-400/30 hover:bg-background/80'
                    >
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <p className='text-base font-semibold text-foreground'>
                            {template.totalHours}h total · {template.name}
                          </p>
                        </div>
                        <div className='flex shrink-0 items-center gap-2'>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            className='h-7 gap-1 border-cyan-400/40 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-200'
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleOpenDetails(template);
                            }}
                          >
                            <Info className='h-3.5 w-3.5' />
                            Details
                          </Button>
                          <Button
                            type='button'
                            size='sm'
                            className='h-7 gap-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleAcceptTemplate(template);
                            }}
                          >
                            <CheckCircle2 className='h-3.5 w-3.5' />
                            {isSubmitting ? 'Creating...' : 'Accept Plan'}
                          </Button>
                        </div>
                      </div>

                      <p className='mt-2 text-sm text-muted-foreground'>{template.description}</p>

                      <p className='mt-3 text-xs uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200'>Ideal for: {template.targetAudience}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium text-foreground'>Weeks to Prepare</label>
                  <Select
                    value={String(customWeeks)}
                    onValueChange={(v) => {
                      resetReviewState();
                      setCustomWeeks(Number(v));
                    }}
                  >
                    <SelectTrigger className='border-border bg-background/70 text-foreground'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOM_WEEKS_OPTIONS.map((w) => (
                        <SelectItem key={w} value={String(w)}>
                          {w === 1 ? '1 week' : `${w} weeks`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid gap-2'>
                  <label className='text-sm font-medium text-foreground'>
                    <span className='inline-flex items-center gap-1'>
                      <Clock4 className='h-3.5 w-3.5' />
                      Hours per Day
                    </span>
                  </label>
                  <Select
                    value={String(customHoursPerDay)}
                    onValueChange={(v) => {
                      resetReviewState();
                      setCustomHoursPerDay(Number(v));
                    }}
                  >
                    <SelectTrigger className='border-border bg-background/70 text-foreground'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOM_HOURS_OPTIONS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h}h / day
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingTemplates && (
                <div className='rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground'>Loading plan...</div>
              )}

              {!isLoadingTemplates && customVariantTemplate && (
                <div className='grid gap-3'>
                  <label className='text-sm font-medium text-foreground'>Your Plan</label>
                  <div className='rounded-xl border border-border/70 bg-background/50 p-4 transition-colors hover:border-cyan-400/30 hover:bg-background/80'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <p className='text-base font-semibold text-foreground'>
                            {customVariantTemplate.totalHours}h total · {customVariantTemplate.name}
                          </p>
                        </div>
                      <div className='flex shrink-0 items-center gap-2'>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          className='h-7 gap-1 border-cyan-400/40 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-200'
                          onClick={() => void handleOpenCustomDetails()}
                        >
                          <Info className='h-3.5 w-3.5' />
                          Details
                        </Button>
                        <Button
                          type='submit'
                          size='sm'
                          className='h-7 gap-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                          disabled={isSubmitting}
                        >
                          <CheckCircle2 className='h-3.5 w-3.5' />
                          {isSubmitting ? 'Creating...' : 'Accept Plan'}
                        </Button>
                      </div>
                    </div>
                    <p className='mt-3 text-xs uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200'>
                      Ideal for: {customVariantTemplate.targetAudience}
                    </p>
                  </div>
                </div>
              )}

              {!isLoadingTemplates && !customVariantTemplate && (
                <div className='grid gap-3'>
                  <label className='text-sm font-medium text-foreground'>Your Plan</label>
                  <div className='rounded-xl border border-border/70 bg-background/50 p-4 transition-colors hover:border-cyan-400/30 hover:bg-background/80'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <p className='text-base font-semibold text-foreground'>
                            {customWeeks * customHoursPerDay * 7}h total · Custom
                          </p>
                        </div>
                      <div className='flex shrink-0 items-center gap-2'>
                      <Button
                        type='submit'
                        size='sm'
                        className='h-7 shrink-0 gap-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                        disabled={isSubmitting}
                      >
                        <CheckCircle2 className='h-3.5 w-3.5' />
                        {isSubmitting ? 'Creating...' : 'Create Plan'}
                      </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <PlanDetailsModal
            template={detailsTemplate}
            materials={materials}
            detailsSummary={previewDetails}
            isLoadingPreview={isLoadingPreview}
            open={detailsTemplate !== null}
            onOpenChange={(open) => { if (!open) { setDetailsTemplate(null); setPreviewDetails(null); } }}
          />
        </form>
      </CardContent>
    </Card>
  );
}
