'use client';

import { format } from 'date-fns';
import { CheckCircle2, ClipboardCheck, Clock4, Copy, Info } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { createStudyPlan, fetchStudyMaterials, fetchStudyPlanTemplates } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MATERIAL_TYPE_LABELS, PlanDetailsModal } from '@/features/study-plans/PlanDetailsModal';
import type { CertificationItem, StudyMaterialItem, StudyPlanTemplate } from '@/lib/api/study-plans';

type PlanMode = 'template' | 'custom';

function addDays(baseDate: Date, days: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getDaysUntil(targetDate: Date): number {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const normalizedTargetDate = new Date(targetDate);
  normalizedTargetDate.setHours(0, 0, 0, 0);

  return Math.ceil((normalizedTargetDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
}

function buildTemplateCopyText(
  template: StudyPlanTemplate,
  materials: StudyMaterialItem[],
  certificationCode?: string,
): string {
  const materialById = new Map(materials.map((m) => [m.id, m]));

  const lines: string[] = [
    '# AWS Certification Study Plan – AI Validation Request',
    '',
    `Please review the following study plan for the **${certificationCode ?? 'AWS'} certification** and provide feedback on:`,
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
    '## Week-by-Week Breakdown',
    '',
  ];

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
        const url = full?.url ?? '';
        lines.push(`- **${r.title}** (${typeLabel})${freeLabel ? ` – ${freeLabel}` : ''}${topic ? ` | ${topic}` : ''}`);
        if (url) lines.push(`  URL: ${url}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customWeeks, setCustomWeeks] = useState<number>(4);
  const [customHoursPerDay, setCustomHoursPerDay] = useState<number>(2);

  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsTemplate, setDetailsTemplate] = useState<StudyPlanTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const today = new Date();
  const featuredTemplates = templates.filter((t) => !/^saa-c03-\d+w-\d+h$/.test(t.slug));
  const selectedTemplate = featuredTemplates.find((t) => t.slug === selectedTemplateId) ?? featuredTemplates[1] ?? featuredTemplates[0];
  const customVariantSlug = `saa-c03-${customWeeks}w-${customHoursPerDay}h`;
  const customVariantTemplate = templates.find((t) => t.slug === customVariantSlug) ?? null;
  const activeTemplate = planMode === 'template' ? selectedTemplate : customVariantTemplate;
  const effectiveTargetDate = activeTemplate
    ? addDays(today, activeTemplate.recommendedWeeks * 7)
    : addDays(today, customWeeks * 7);
  const effectiveTargetDateStr = effectiveTargetDate ? format(effectiveTargetDate, 'yyyy-MM-dd') : '';
  const effectiveDailyHours = activeTemplate?.recommendedDailyHours ?? customHoursPerDay;
  const daysUntil = effectiveTargetDate ? getDaysUntil(effectiveTargetDate) : 0;
  const totalHours = activeTemplate?.totalHours ?? (daysUntil * effectiveDailyHours);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTemplates(true);

    async function loadTemplates(): Promise<void> {
      try {
        const data = await fetchStudyPlanTemplates(token);
        if (isMounted) {
          setTemplates(data);
          setSelectedTemplateId((prev) => prev || data[1]?.slug || data[0]?.slug || '');
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

  async function handleCopy(text: string, id: string): Promise<void> {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleAcceptTemplate(template: StudyPlanTemplate): Promise<void> {
    if (!certificationId || !effectiveTargetDateStr) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createStudyPlan({
        certificationId,
        targetDate: effectiveTargetDateStr,
        dailyHours: template.recommendedDailyHours,
        selectedMaterialIds: template.selectedMaterialIds,
      }, token);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study plan');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAcceptCustomVariant(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!certificationId || !effectiveTargetDateStr || !customVariantTemplate) return;
    await handleAcceptTemplate(customVariantTemplate);
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
                      onClick={() => {
                        resetReviewState();
                        setSelectedTemplateId(template.slug);
                      }}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-colors cursor-pointer',
                        selectedTemplateId === template.slug
                          ? 'border-cyan-400/60 bg-cyan-500/10'
                          : 'border-border/70 bg-background/50 hover:border-cyan-400/30 hover:bg-background/80',
                      )}
                    >
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <p className='text-base font-semibold text-foreground'>{template.name}</p>
                        <div className='flex shrink-0 items-center gap-2'>
                          <Badge variant='outline'>{template.recommendedWeeks} weeks</Badge>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            className='h-7 gap-1 border-cyan-400/40 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-200'
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailsTemplate(template);
                            }}
                          >
                            <Info className='h-3.5 w-3.5' />
                            Details
                          </Button>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            className='h-7 gap-1 border-cyan-400/40 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-200'
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleCopy(
                                buildTemplateCopyText(template, materials, certifications.find((c) => c.id === certificationId)?.code),
                                template.slug,
                              );
                            }}
                          >
                            {copiedId === template.slug
                              ? <ClipboardCheck className='h-3.5 w-3.5' />
                              : <Copy className='h-3.5 w-3.5' />}
                            {copiedId === template.slug ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            type='button'
                            size='sm'
                            className='h-7 gap-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplateId(template.slug);
                              void handleAcceptTemplate(template);
                            }}
                          >
                            <CheckCircle2 className='h-3.5 w-3.5' />
                            {isSubmitting ? 'Creating...' : 'Accept Plan'}
                          </Button>
                        </div>
                      </div>

                      <p className='mt-2 text-sm text-muted-foreground'>{template.description}</p>

                      <div className='mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground'>
                        <span>{template.recommendedDailyHours}h/day</span>
                        <span>{template.tagline}</span>
                      </div>

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
                  <div className='rounded-xl border border-cyan-400/60 bg-cyan-500/10 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-base font-semibold text-foreground'>{customVariantTemplate.name}</p>
                        <p className='mt-1 text-sm text-muted-foreground'>{customVariantTemplate.tagline}</p>
                      </div>
                      <div className='flex shrink-0 items-center gap-2'>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          className='h-7 gap-1 border-cyan-400/40 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-200'
                          onClick={() => setDetailsTemplate(customVariantTemplate)}
                        >
                          <Info className='h-3.5 w-3.5' />
                          Details
                        </Button>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          className='h-7 gap-1 border-cyan-400/40 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-200'
                          onClick={() => {
                            void handleCopy(
                              buildTemplateCopyText(
                                customVariantTemplate,
                                materials,
                                certifications.find((c) => c.id === certificationId)?.code,
                              ),
                              'custom-variant',
                            );
                          }}
                        >
                          {copiedId === 'custom-variant'
                            ? <ClipboardCheck className='h-3.5 w-3.5' />
                            : <Copy className='h-3.5 w-3.5' />}
                          {copiedId === 'custom-variant' ? 'Copied!' : 'Copy'}
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
                    <div className='mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground'>
                      <span>{customVariantTemplate.recommendedWeeks === 1 ? '1 week' : `${customVariantTemplate.recommendedWeeks} weeks`}</span>
                      <span>{customVariantTemplate.recommendedDailyHours}h/day</span>
                      <span>{customVariantTemplate.totalHours}h total</span>
                    </div>
                    <p className='mt-3 text-xs uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200'>
                      Ideal for: {customVariantTemplate.targetAudience}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className='rounded-xl border border-border/70 bg-background/60 p-4'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold text-foreground'>Plan Snapshot</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {activeTemplate
                    ? `${activeTemplate.name} targets ${format(effectiveTargetDate, 'PPP')} at ${effectiveDailyHours}h per day.`
                    : `Select weeks and hours above to preview your plan.`}
                </p>
              </div>
              {activeTemplate && <Badge variant='outline'>{activeTemplate.targetAudience}</Badge>}
            </div>

            <div className='mt-4 grid gap-3 sm:grid-cols-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>Exam Date</p>
                <p className='mt-1 text-sm font-semibold text-foreground'>
                  {effectiveTargetDate ? format(effectiveTargetDate, 'PPP') : 'Not selected'}
                </p>
              </div>
              <div>
                <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>Daily Pace</p>
                <p className='mt-1 text-sm font-semibold text-foreground'>{effectiveDailyHours}h per day</p>
              </div>
              <div>
                <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>Estimated Hours</p>
                <p className='mt-1 text-sm font-semibold text-foreground'>{totalHours > 0 ? `${totalHours} total hours` : 'Pick a future date'}</p>
              </div>
            </div>
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <PlanDetailsModal
            template={detailsTemplate}
            materials={materials}
            open={detailsTemplate !== null}
            onOpenChange={(open) => { if (!open) setDetailsTemplate(null); }}
          />
        </form>
      </CardContent>
    </Card>
  );
}
