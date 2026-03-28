'use client';

import { CalendarRange, CheckCircle2, ChevronDown, Clock4, FileText, RotateCcw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { fetchStudyMaterials, fetchStudyPlanTemplates } from '@/lib/api/study-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlanDetailsModal } from '@/features/study-plans/PlanDetailsModal';
import type { StudyMaterialItem, StudyPlanTemplate } from '@/lib/api/study-plans';
import type { DashboardStudyPlan } from '@aws-exam-prep/types';

interface ActiveStudyPlanProps {
  studyPlan: DashboardStudyPlan;
  token: string | null;
  isResetting?: boolean;
  onReset?: () => void;
}

export function ActiveStudyPlan({ studyPlan, token, isResetting, onReset }: ActiveStudyPlanProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [template, setTemplate] = useState<StudyPlanTemplate | null>(null);
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  useEffect(() => {
    if (!detailsOpen || !token) return;
    if (template) return; // already loaded

    setTemplateLoading(true);
    setTemplateError(null);

    Promise.all([
      fetchStudyPlanTemplates(token),
      fetchStudyMaterials(studyPlan.certificationId, token),
    ])
      .then(([templates, mats]) => {
        const featured = templates.filter((t) => !/^saa-c03-\d+w-\d+h$/.test(t.slug));
        const matched =
          featured.find((t) => t.recommendedDailyHours === studyPlan.dailyHours) ??
          featured[0] ??
          templates[0] ??
          null;
        setTemplate(matched ?? null);
        setMaterials(mats);
      })
      .catch((err: unknown) => {
        setTemplateError(err instanceof Error ? err.message : 'Failed to load plan details');
      })
      .finally(() => setTemplateLoading(false));
  }, [detailsOpen, token, template, studyPlan.certificationId, studyPlan.dailyHours]);

  const targetDateFormatted = new Date(studyPlan.targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className='border-border/70 bg-card/80'>
      {/* Always-visible single row */}
      <div className='flex flex-wrap items-center justify-between gap-3 px-5 py-3'>
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className='flex min-w-0 flex-1 items-center gap-3 text-left'
        >
          <Badge className='shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'>
            <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
            Active
          </Badge>
          <span className='truncate text-sm font-semibold text-foreground'>
            {studyPlan.certificationCode} &mdash; {studyPlan.certificationName}
          </span>
          <span className='hidden shrink-0 text-xs text-muted-foreground sm:inline'>
            {targetDateFormatted} &middot; {studyPlan.dailyHours}h/day
          </span>
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        <Button
          variant='outline'
          size='sm'
          className='shrink-0 gap-2 border-border bg-background/70'
          onClick={() => setDetailsOpen(true)}
        >
          <FileText className='h-4 w-4' />
          Details
        </Button>

        {onReset && (
          <Button
            variant='destructive'
            size='sm'
            className='shrink-0 gap-2'
            disabled={isResetting}
            onClick={onReset}
          >
            <RotateCcw className='h-4 w-4' />
            {isResetting ? 'Resetting...' : 'Reset Plan'}
          </Button>
        )}
      </div>

      {/* Expandable details */}
      {expanded && (
        <CardContent className='border-t border-border/60 pt-4'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <PlanDetail
              label='Certification'
              value={`${studyPlan.certificationCode} — ${studyPlan.certificationName}`}
            />
            <PlanDetail
              label='Target Date'
              value={new Date(studyPlan.targetDate + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              icon={<CalendarRange className='h-3.5 w-3.5' />}
            />
            <PlanDetail
              label='Daily Commitment'
              value={`${studyPlan.dailyHours} hour${studyPlan.dailyHours !== 1 ? 's' : ''} / day`}
              icon={<Clock4 className='h-3.5 w-3.5' />}
            />
          </div>
        </CardContent>
      )}

      {/* Loading / error state shown outside the modal while data is fetching */}
      {detailsOpen && templateLoading && (
        <p className='px-5 py-2 text-sm text-muted-foreground'>Loading plan details…</p>
      )}
      {detailsOpen && templateError && (
        <p className='px-5 py-2 text-sm text-destructive'>{templateError}</p>
      )}

      <PlanDetailsModal
        template={template}
        materials={materials}
        open={detailsOpen && !templateLoading && !templateError}
        onOpenChange={setDetailsOpen}
      />
    </Card>
  );
}

function PlanDetail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className='space-y-1 rounded-xl border border-border/60 bg-background/50 p-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>{label}</p>
      <p className='flex items-center gap-1.5 text-sm font-medium text-foreground'>
        {icon}
        {value}
      </p>
    </div>
  );
}
