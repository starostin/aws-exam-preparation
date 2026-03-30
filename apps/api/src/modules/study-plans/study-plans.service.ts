import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, inArray, lte, or, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';
import type { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import type { RescheduleTaskDto } from './dto/reschedule-task.dto';
import type { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { SAA_STUDY_PLANS } from '../../database/seeds/data/saa-c03-study-plans';
import { COURSE_CATALOG, type SaaCourse } from '../../database/seeds/data/saa-c03-courses';
import { WAF_CATALOG } from '../../database/seeds/data/saa-c03-well-architected';
import { TD_CATALOG } from '../../database/seeds/data/saa-c03-tutorials-dojo';
import { SAA_TOPICS } from '../../database/seeds/data/saa-c03-materials';

type StudyTaskType = 'read' | 'quiz' | 'flashcard' | 'mock_exam' | 'review' | 'course' | 'video';
type StudyTaskStatus = 'pending' | 'in_progress' | 'completed' | 'carried_over';
type ExternalResourceType = 'course' | 'video' | 'docs' | 'practice_test';

export interface StudyPlanTemplateResource {
  id: string;
  title: string;
  type: string;
}

export interface StudyPlanTemplatePhase {
  name: string;
  description: string;
  weekNumbers: number[];
  resources: StudyPlanTemplateResource[];
  focusTopicSlugs: string[];
}

export interface StudyPlanTemplate {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  totalHours: number;
  recommendedDailyHours: number;
  recommendedWeeks: number;
  targetAudience: string;
  /** Pre-resolved DB IDs ready for use as CreateStudyPlanDto.selectedMaterialIds */
  selectedMaterialIds: string[];
  phases: StudyPlanTemplatePhase[];
}

export interface StudyTaskItem {
  id: string;
  topicId: string | null;
  type: StudyTaskType;
  status: StudyTaskStatus;
  scheduledDate: string;
  topicTitle: string | null;
  title: string | null;
  courseName: string | null;
  externalResourceId: string | null;
  topicResourceUrl: string | null;
  estimatedMinutes: number;
}

export interface DashboardStudyPlan {
  id: string;
  certificationId: string;
  certificationName: string;
  certificationCode: string;
  targetDate: string;
  startDate: string;
  dailyHours: number;
}

export interface UpcomingDay {
  date: string;
  tasks: StudyTaskItem[];
}

export interface DashboardStats {
  streak: number;
  topicsCompleted: number;
  totalTopics: number;
  completedTasksTotal: number;
  readinessScore: number | null;
  quizAccuracy: number | null;
}

export interface DashboardResponse {
  studyPlan: DashboardStudyPlan | null;
  todaysTasks: StudyTaskItem[];
  carryOverTasks: StudyTaskItem[];
  upcomingTasks: UpcomingDay[];
  stats: DashboardStats;
}

export interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasks: StudyTaskItem[];
}

export interface PlanScheduleResponse {
  weeks: WeekSchedule[];
}

// Estimated minutes each task type takes
const TASK_MINUTES: Record<string, number> = {
  read: 30,
  quiz: 10,
  review: 15,
  flashcard: 10,
  mock_exam: 90,
  course: 90,
  video: 45,
};

const COURSE_SEGMENT_MINUTES = 90;
const VIDEO_SEGMENT_MINUTES = 45;
const MIN_SEGMENT_MINUTES = 20;
const MAX_UNSPLIT_TASK_MINUTES = 120;
const MIN_MIXED_ACTIVITY_MINUTES = 30;
const RESOURCE_BUDGET_RATIO = 0.65;
const REQUIRED_SAA_COURSE_TITLE = 'Ultimate SAA-C03 Course by Stephane Maarek';
const REQUIRED_TD_PRACTICE_TEST_TITLE = 'Tutorials Dojo Practice Exams (Jon Bonso)';
const EXAM_GUIDE_TITLE = 'SAA-C03 Exam Guide';
const FINAL_MOCK_EXAM_TAG = 'final-mock-exam';
const FINAL_MOCK_EXAM_TITLE = 'Mocked exam';

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export type PlanRow = {
  id: string;
  certificationId: string;
  certificationName: string;
  certificationCode: string;
  targetDate: string;
  startDate: Date;
  dailyHours: number;
};

type ExternalResourceTask = {
  id: string;
  topicId: string | null;
  title: string;
  type: ExternalResourceType;
  priority: number;
  estimatedMinutes: number | null;
  tags: string[];
};

@Injectable()
export class StudyPlansService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // ─── Certifications ─────────────────────────────────────────────────────────

  async getCertifications(): Promise<{ id: string; code: string; name: string; provider: string }[]> {
    return this.db
      .select({
        id: schema.certifications.id,
        code: schema.certifications.code,
        name: schema.certifications.name,
        provider: schema.certifications.provider,
      })
      .from(schema.certifications)
      .orderBy(asc(schema.certifications.code));
  }

  async getStudyPlanTemplates(): Promise<StudyPlanTemplate[]> {
    const allResources = await this.db
      .select({
        id: schema.externalResources.id,
        title: schema.externalResources.title,
        type: schema.externalResources.type,
      })
      .from(schema.externalResources)
      .innerJoin(
        schema.certifications,
        eq(schema.externalResources.certificationId, schema.certifications.id),
      )
      .where(eq(schema.certifications.code, 'SAA-C03'));

    const resourceByTitle = new Map(allResources.map((r) => [r.title, r]));

    return SAA_STUDY_PLANS.map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      tagline: plan.tagline,
      description: plan.description,
      totalHours: plan.totalHours,
      recommendedDailyHours: plan.recommendedDailyHours,
      recommendedWeeks: plan.recommendedWeeks,
      targetAudience: plan.targetAudience,
      selectedMaterialIds: plan.resourceTitles
        .map((title) => resourceByTitle.get(title)?.id)
        .filter((id): id is string => id !== undefined),
      phases: plan.phases.map((phase) => ({
        name: phase.name,
        description: phase.description,
        weekNumbers: phase.weekNumbers,
        focusTopicSlugs: phase.focusTopicSlugs,
        resources: phase.resourceTitles
          .map((title) => resourceByTitle.get(title))
          .filter((r): r is StudyPlanTemplateResource => r !== undefined),
      })),
    }));
  }

  private isStudyPlanDeletedFkViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const dbError = error as { code?: string; constraint?: string };
    return (
      dbError.code === '23503' &&
      dbError.constraint === 'study_tasks_study_plan_id_study_plans_id_fk'
    );
  }

  // ─── Study Plan ─────────────────────────────────────────────────────────────

  async createStudyPlan(userId: string, dto: CreateStudyPlanDto): Promise<{ id: string }> {
    const existing = await this.db
      .select({ id: schema.studyPlans.id })
      .from(schema.studyPlans)
      .where(
        and(
          eq(schema.studyPlans.userId, userId),
          eq(schema.studyPlans.certificationId, dto.certificationId),
        ),
      )
      .limit(1);

    let planId: string;

    if (existing.length > 0) {
      await this.db
        .update(schema.studyPlans)
        .set({
          targetDate: dto.targetDate,
          dailyHours: dto.dailyHours,
          updatedAt: new Date(),
        })
        .where(eq(schema.studyPlans.id, existing[0]!.id));
      planId = existing[0]!.id;
    } else {
      const [created] = await this.db
        .insert(schema.studyPlans)
        .values({
          userId,
          certificationId: dto.certificationId,
          targetDate: dto.targetDate,
          dailyHours: dto.dailyHours,
        })
        .returning({ id: schema.studyPlans.id });

      if (!created) throw new Error('Failed to create study plan');
      planId = created.id;
    }

    await this.regenerateResourceTasks(
      planId,
      dto.certificationId,
      dto.dailyHours,
      dto.targetDate,
      dto.selectedMaterialIds,
    );

    return { id: planId };
  }

  private async regenerateResourceTasks(
    studyPlanId: string,
    certificationId: string,
    dailyHours: number,
    targetDate: string,
    selectedMaterialIds?: string[],
  ): Promise<void> {
    // ── 1. Preserve progress: track completed minutes per topic ──────────────
    const completedRows = await this.db
      .select({
        topicId: schema.studyTasks.topicId,
        minutes: sql<number>`SUM(COALESCE(${schema.studyTasks.plannedMinutes}, 0))`,
      })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, studyPlanId),
          eq(schema.studyTasks.status, 'completed'),
          sql`${schema.studyTasks.topicId} IS NOT NULL`,
        ),
      )
      .groupBy(schema.studyTasks.topicId);

    const completedMinutesByTopic = new Map<string, number>();
    for (const row of completedRows) {
      if (!row.topicId) continue;
      completedMinutesByTopic.set(row.topicId, Number(row.minutes ?? 0));
    }

    // ── 2. Delete all non-completed tasks (plan is rebuilt from scratch) ──────
    await this.db
      .delete(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, studyPlanId),
          inArray(schema.studyTasks.status, ['pending', 'in_progress', 'carried_over']),
        ),
      );

    // ── 3. Load all topics (including intro-general) ──────────────────────────
    const topicRows = await this.db
      .select({
        id: schema.topics.id,
        title: schema.topics.title,
        domainWeight: schema.domains.weightPercent,
      })
      .from(schema.topics)
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(eq(schema.domains.certificationId, certificationId))
      .orderBy(desc(schema.domains.weightPercent), asc(schema.topics.createdAt));

    if (topicRows.length === 0) return;

    // Build slug → topicId map using SAA_TOPICS seed data as the title→slug bridge
    const titleToTopicId = new Map(topicRows.map((t) => [t.title, t.id]));
    const slugToTopicId = new Map<string, string>();
    for (const seedTopic of SAA_TOPICS) {
      const topicId = titleToTopicId.get(seedTopic.title);
      if (topicId) slugToTopicId.set(seedTopic.slug, topicId);
    }

    // Build lookup: `${collection.resourceTitle}:${topicId}` → section display title.
    // Used when scheduling WAF/TD docs tasks so the task.title = the section's
    // display name (e.g., "Reliability Pillar") while courseName = the collection
    // title (e.g., "AWS Well-Architected Framework") — matching the course pattern.
    const docsSectionTitleMap = new Map<string, string>();
    for (const collection of [...WAF_CATALOG, ...TD_CATALOG]) {
      for (const section of collection.sections) {
        const topicId = slugToTopicId.get(section.topicSlug);
        if (topicId) {
          docsSectionTitleMap.set(`${collection.resourceTitle}:${topicId}`, section.title);
        }
      }
    }

    const topicIds = topicRows.map((t) => t.id);

    // ── 4. Find topics that have quiz questions and flashcards ────────────────
    const [quizTopicRows, flashcardTopicRows] = await Promise.all([
      this.db
        .selectDistinct({ topicId: schema.quizQuestions.topicId })
        .from(schema.quizQuestions)
        .where(inArray(schema.quizQuestions.topicId, topicIds)),
      this.db
        .selectDistinct({ topicId: schema.flashcards.topicId })
        .from(schema.flashcards)
        .where(inArray(schema.flashcards.topicId, topicIds)),
    ]);

    const quizTopicIds = new Set(quizTopicRows.map((r) => r.topicId));
    const flashcardTopicIds = new Set(flashcardTopicRows.map((r) => r.topicId));

    // ── 5. Load selected resources ────────────────────────────────────────────
    const allResources = await this.db
      .select({
        id: schema.externalResources.id,
        topicId: schema.externalResources.topicId,
        title: schema.externalResources.title,
        type: schema.externalResources.type,
        priority: schema.externalResources.priority,
        estimatedMinutes: schema.externalResources.estimatedMinutes,
        tags: schema.externalResources.tags,
      })
      .from(schema.externalResources)
      .where(
        and(
          eq(schema.externalResources.certificationId, certificationId),
          inArray(schema.externalResources.type, ['course', 'video', 'docs', 'practice_test']),
        ),
      )
      .orderBy(
        desc(schema.externalResources.priority),
        desc(schema.externalResources.estimatedMinutes),
        asc(schema.externalResources.title),
      );

    const normalizedResources = allResources.filter(
      (r): r is ExternalResourceTask =>
        r.type === 'course' || r.type === 'video' || r.type === 'docs' || r.type === 'practice_test',
    );

    if (normalizedResources.length === 0) return;

    const baseSelectedResources = selectedMaterialIds?.length
      ? this.selectResourcesFromIdsWithRequiredCourse(normalizedResources, selectedMaterialIds)
      : this.selectDefaultResources(normalizedResources, dailyHours);

    // Always merge in all topic-scoped docs regardless of selection path.
    // This ensures WAF pillar and TD per-topic cheat sheet entries are always
    // scheduled even when the user's plan was created before those resources existed.
    const baseSelectedIds = new Set(baseSelectedResources.map((r) => r.id));
    const extraTopicDocs = normalizedResources.filter(
      (r) => r.type === 'docs' && r.topicId !== null && !baseSelectedIds.has(r.id),
    );
    let selectedResources = extraTopicDocs.length > 0
      ? [...baseSelectedResources, ...extraTopicDocs]
      : baseSelectedResources;

    const tutorialsDojoPracticeTest = normalizedResources.find(
      (resource) =>
        resource.type === 'practice_test'
        && resource.title.trim().toLowerCase() === REQUIRED_TD_PRACTICE_TEST_TITLE.toLowerCase(),
    );
    const finalMockExamResourceFromCatalog = normalizedResources.find(
      (resource) => resource.type === 'practice_test' && resource.tags.includes(FINAL_MOCK_EXAM_TAG),
    );

    const selectedResourceIds = new Set(selectedResources.map((resource) => resource.id));
    const requiredPracticeTests = [tutorialsDojoPracticeTest, finalMockExamResourceFromCatalog].filter(
      (resource): resource is ExternalResourceTask => resource !== undefined,
    );
    const missingRequiredPracticeTests = requiredPracticeTests.filter(
      (resource) => !selectedResourceIds.has(resource.id),
    );
    if (missingRequiredPracticeTests.length > 0) {
      selectedResources = [...selectedResources, ...missingRequiredPracticeTests];
    }

    if (selectedResources.length === 0) return;

    // ── 6. Build topic → course sections map ─────────────────────────────────
    // Every course section now has a topicSlug (intro sections use 'intro-general'),
    // so there are no unassigned intro sections left.
    const topicSectionMap = this.buildTopicSectionMap(selectedResources, slugToTopicId);

    // ── 7. Determine topic ordering: follow course section order ──────────────
    // Find the first selected course in COURSE_CATALOG and walk its sections to
    // derive the canonical topic order. Topics not in any section go at the end.
    const topicIdOrder = new Map<string, number>();
    for (const courseData of COURSE_CATALOG) {
      const isSelected = selectedResources.some(
        (r) => (r.type === 'course' || r.type === 'video') && r.title === courseData.resourceTitle,
      );
      if (!isSelected) continue;

      for (const section of courseData.sections) {
        const primarySlug = section.topicSlugs[0];
        if (!primarySlug) continue;
        const topicId = slugToTopicId.get(primarySlug);
        if (topicId && !topicIdOrder.has(topicId)) {
          topicIdOrder.set(topicId, topicIdOrder.size);
        }
      }
      break; // Only use the first matched course for ordering
    }

    const orderedTopics = [...topicRows].sort((a, b) => {
      const posA = topicIdOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const posB = topicIdOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      if (posA !== posB) return posA - posB;
      // Stable fallback: domain weight desc, then creation order (preserved from original query)
      return b.domainWeight - a.domainWeight;
    });

    // ── 8. Separate topic-scoped docs from practice tests ─────────────────────
    // All docs now have a topicId (either a real topic or intro-general).
    // Practice tests remain null-topicId and run after all topics.
    const topicScopedResources = selectedResources.filter(
      (r) => r.type === 'docs' && r.topicId !== null,
    );
    // Group topic-scoped docs by topicId for quick lookup
    const topicDocMap = new Map<string, ExternalResourceTask[]>();
    for (const res of topicScopedResources) {
      if (!res.topicId) continue;
      const arr = topicDocMap.get(res.topicId) ?? [];
      arr.push(res);
      topicDocMap.set(res.topicId, arr);
    }

    const practiceTests = selectedResources.filter((r) => r.type === 'practice_test');
    const finalMockExamResource = finalMockExamResourceFromCatalog
      ?? practiceTests.find((resource) => resource.tags.includes(FINAL_MOCK_EXAM_TAG))
      ?? [...practiceTests].sort((a, b) => b.priority - a.priority || (b.estimatedMinutes ?? 0) - (a.estimatedMinutes ?? 0))[0];
    const regularPracticeTests = finalMockExamResource
      ? practiceTests.filter((resource) => resource.id !== finalMockExamResource.id)
      : practiceTests;

    // ── 9. Build schedule dates ───────────────────────────────────────────────
    const scheduleDates = this.buildScheduleDates(targetDate);
    if (scheduleDates.length === 0) return;

    const dailyBudget = Math.max(MIN_SEGMENT_MINUTES, Math.floor(dailyHours * 60));
    let dateIndex = 0;
    let dayRemaining = dailyBudget;
    let dayUsed = false; // track whether any task was placed on the current day

    const tasksToInsert: (typeof schema.studyTasks.$inferInsert)[] = [];

    const advanceDay = (): void => {
      dateIndex++;
      dayRemaining = dailyBudget;
      dayUsed = false;
    };

    const ensureBudget = (needed: number): boolean => {
      if (dayRemaining >= needed) return true;
      if (dateIndex < scheduleDates.length - 1) {
        advanceDay();
        return dayRemaining >= needed;
      }
      return false;
    };

    const pushTask = (task: Omit<typeof schema.studyTasks.$inferInsert, 'sortOrder'>): void => {
      tasksToInsert.push({ ...task, sortOrder: tasksToInsert.length });
      dayUsed = true;
    };

    // ── 9a. Pre-place Exam Guide on Day 1 ────────────────────────────────────
    // The Exam Guide is always placed first, alone on Day 1. After placing it
    // the day counter advances to Day 2 so intro-general's course sections
    // do not start until Day 2.
    const prePlacedResourceIds = new Set<string>();
    const examGuide = selectedResources.find(
      (r) => r.type === 'docs' && r.title.trim() === EXAM_GUIDE_TITLE,
    );
    if (examGuide && scheduleDates.length > 0) {
      const guideMinutes = examGuide.estimatedMinutes ?? TASK_MINUTES['read'] ?? 30;
      pushTask({
        studyPlanId,
        topicId: examGuide.topicId,
        externalResourceId: examGuide.id,
        title: examGuide.title,
        type: 'read',
        status: 'pending',
        scheduledDate: scheduleDates[0]!,
        plannedMinutes: Math.min(guideMinutes, dailyBudget),
      });
      prePlacedResourceIds.add(examGuide.id);
      // Advance to Day 2 — intro-general course sections start fresh here
      advanceDay();
    }

    // ── 9b. Topic scheduling ───────────────────────────────────────────────────
    // Topics with course sections run first (prevents docs-only topics from
    // interrupting the course stream). Within each topic all content is grouped:
    // course sections → docs → quiz/flashcard, all scheduled consecutively.
    const topicsWithSections = orderedTopics.filter(
      (t) => (topicSectionMap.get(t.id) ?? []).length > 0,
    );
    const topicsWithoutSections = orderedTopics.filter(
      (t) => (topicSectionMap.get(t.id) ?? []).length === 0,
    );

    for (const topic of [...topicsWithSections, ...topicsWithoutSections]) {
      if (dateIndex >= scheduleDates.length) break;
      if (dayUsed) advanceDay();
      if (dateIndex >= scheduleDates.length) break;

      const sections = topicSectionMap.get(topic.id) ?? [];
      const topicDocs = topicDocMap.get(topic.id) ?? [];
      const hasQuiz = quizTopicIds.has(topic.id);
      const hasFlashcard = flashcardTopicIds.has(topic.id);

      if (sections.length === 0 && topicDocs.length === 0 && !hasQuiz && !hasFlashcard) {
        // Fallback: no course section and no docs for this topic — plain read task
        if (!ensureBudget(MIN_SEGMENT_MINUTES)) continue;
        const readMinutes = Math.min(TASK_MINUTES['read']!, dayRemaining);
        pushTask({
          studyPlanId,
          topicId: topic.id,
          type: 'read',
          status: 'pending',
          scheduledDate: scheduleDates[dateIndex]!,
          plannedMinutes: readMinutes,
        });
        dayRemaining -= readMinutes;
      } else {
        // ── Course sections ──
        const topicCompletedMinutes = completedMinutesByTopic.get(topic.id) ?? 0;
        let topicRemainingCompleted = topicCompletedMinutes;

        for (const { section, courseResource } of sections) {
          if (dateIndex >= scheduleDates.length) break;

          const taskType = this.mapExternalResourceTypeToTaskType(courseResource.type);
          let sectionRemaining = section.estimatedMinutes;

          // Skip minutes already covered by previously completed tasks
          if (topicRemainingCompleted >= sectionRemaining) {
            topicRemainingCompleted -= sectionRemaining;
            continue;
          }
          sectionRemaining -= Math.min(topicRemainingCompleted, sectionRemaining);
          topicRemainingCompleted = 0;

          while (sectionRemaining > 0 && dateIndex < scheduleDates.length) {
            if (dayRemaining < MIN_SEGMENT_MINUTES) advanceDay();
            if (dateIndex >= scheduleDates.length) break;

            const keepWholeTask = sectionRemaining <= MAX_UNSPLIT_TASK_MINUTES;
            const chunk = keepWholeTask
              ? sectionRemaining
              : Math.min(sectionRemaining, dayRemaining, COURSE_SEGMENT_MINUTES);

            pushTask({
              studyPlanId,
              topicId: topic.id,
              externalResourceId: courseResource.id,
              title: section.title,
              type: taskType,
              status: 'pending',
              scheduledDate: scheduleDates[dateIndex]!,
              plannedMinutes: chunk,
            });

            sectionRemaining -= chunk;
            dayRemaining -= chunk;
            if (sectionRemaining > 0) advanceDay();
          }
        }

        // ── Topic-scoped docs (immediately after course sections for this topic) ──
        for (const resource of topicDocs) {
          if (prePlacedResourceIds.has(resource.id)) continue;
          if (dateIndex >= scheduleDates.length) break;

          const segmentMinutes = this.getPreferredSegmentMinutes('read');
          let remaining = resource.estimatedMinutes ?? TASK_MINUTES['read'] ?? 30;
          let partIndex = 1;
          const shouldSplit = remaining > MAX_UNSPLIT_TASK_MINUTES;

          // For WAF/TD resources, resource.title = collection name (e.g.,
          // "AWS Well-Architected Framework"). Look up the per-section display
          // title so task.title (e.g., "Reliability Pillar") ≠ resource.title,
          // which makes courseName show the collection name — matching courses.
          const displayTitle =
            docsSectionTitleMap.get(`${resource.title}:${topic.id}`) ?? resource.title;

          if (!shouldSplit) {
            if (dayRemaining < MIN_SEGMENT_MINUTES) advanceDay();
            if (dateIndex >= scheduleDates.length) break;

            pushTask({
              studyPlanId,
              topicId: topic.id,
              externalResourceId: resource.id,
              title: displayTitle,
              type: 'read',
              status: 'pending',
              scheduledDate: scheduleDates[dateIndex]!,
              plannedMinutes: remaining,
            });

            dayRemaining -= remaining;
            continue;
          }

          while (remaining > 0 && dateIndex < scheduleDates.length) {
            if (dayRemaining < MIN_SEGMENT_MINUTES) advanceDay();
            if (dateIndex >= scheduleDates.length) break;

            const chunk = Math.min(remaining, segmentMinutes, dayRemaining);

            pushTask({
              studyPlanId,
              topicId: topic.id,
              externalResourceId: resource.id,
              title: shouldSplit ? `${displayTitle} (Part ${partIndex})` : displayTitle,
              type: 'read',
              status: 'pending',
              scheduledDate: scheduleDates[dateIndex]!,
              plannedMinutes: chunk,
            });

            remaining -= chunk;
            dayRemaining -= chunk;
            partIndex++;
            if (remaining > 0) advanceDay();
          }
        }
      }

      // ── Quiz + Flashcard — back-adjust to fit on the last content day ──
      const neededReserve = (hasQuiz ? TASK_MINUTES['quiz']! : 0) + (hasFlashcard ? TASK_MINUTES['flashcard']! : 0);

      if (neededReserve > 0 && dayRemaining < neededReserve) {
        const currentDate = scheduleDates[dateIndex];
        for (let i = tasksToInsert.length - 1; i >= 0; i--) {
          const t = tasksToInsert[i]!;
          if (t.scheduledDate !== currentDate) break;
          const slack = (t.plannedMinutes ?? 0) - MIN_SEGMENT_MINUTES;
          if (slack <= 0) continue;
          const reduction = Math.min(slack, neededReserve - dayRemaining);
          t.plannedMinutes = (t.plannedMinutes ?? 0) - reduction;
          dayRemaining += reduction;
          if (dayRemaining >= neededReserve) break;
        }
      }

      if (hasQuiz && dateIndex < scheduleDates.length) {
        pushTask({
          studyPlanId,
          topicId: topic.id,
          type: 'quiz',
          status: 'pending',
          scheduledDate: scheduleDates[dateIndex]!,
          plannedMinutes: TASK_MINUTES['quiz']!,
        });
        dayRemaining -= TASK_MINUTES['quiz']!;
      }

      if (hasFlashcard && dateIndex < scheduleDates.length) {
        pushTask({
          studyPlanId,
          topicId: topic.id,
          type: 'flashcard',
          status: 'pending',
          scheduledDate: scheduleDates[dateIndex]!,
          plannedMinutes: TASK_MINUTES['flashcard']!,
        });
        dayRemaining -= TASK_MINUTES['flashcard']!;
      }
    }

    // ── 9c. Practice tests (after all topics, null-topicId) ──────────────────
    // Advance past any topic day before starting practice tests
    if (dayUsed) advanceDay();

    for (const resource of regularPracticeTests) {
      if (dateIndex >= scheduleDates.length) break;

      const segmentMinutes = this.getPreferredSegmentMinutes('mock_exam');
      let remaining = resource.estimatedMinutes ?? TASK_MINUTES['mock_exam'] ?? 90;
      let partIndex = 1;
      const shouldSplit = remaining > MAX_UNSPLIT_TASK_MINUTES;

      if (!shouldSplit) {
        if (dayRemaining < MIN_SEGMENT_MINUTES) advanceDay();
        if (dateIndex >= scheduleDates.length) break;

        pushTask({
          studyPlanId,
          topicId: resource.topicId,
          externalResourceId: resource.id,
          title: resource.title,
          type: 'mock_exam',
          status: 'pending',
          scheduledDate: scheduleDates[dateIndex]!,
          plannedMinutes: remaining,
        });

        dayRemaining -= remaining;
        continue;
      }

      while (remaining > 0 && dateIndex < scheduleDates.length) {
        if (dayRemaining < MIN_SEGMENT_MINUTES) advanceDay();
        if (dateIndex >= scheduleDates.length) break;

        const chunk = Math.min(remaining, segmentMinutes, dayRemaining);

        pushTask({
          studyPlanId,
          topicId: resource.topicId,
          externalResourceId: resource.id,
          title: shouldSplit ? `${resource.title} (Part ${partIndex})` : resource.title,
          type: 'mock_exam',
          status: 'pending',
          scheduledDate: scheduleDates[dateIndex]!,
          plannedMinutes: chunk,
        });

        remaining -= chunk;
        dayRemaining -= chunk;
        partIndex++;
        if (remaining > 0) advanceDay();
      }
    }

    if (scheduleDates.length > 0) {
      pushTask({
        studyPlanId,
        topicId: finalMockExamResource?.topicId ?? null,
        externalResourceId: null,
        title: FINAL_MOCK_EXAM_TITLE,
        type: 'mock_exam',
        status: 'pending',
        scheduledDate: scheduleDates[scheduleDates.length - 1]!,
        plannedMinutes: finalMockExamResource?.estimatedMinutes ?? 130,
      });
    }

    if (tasksToInsert.length > 0) {
      await this.db.insert(schema.studyTasks).values(tasksToInsert);
    }
  }

  /**
   * Builds a map of topicId → course sections from the static course catalog,
   * filtered to only the resources the user has selected.
   * All sections now have a topic (intro sections map to 'intro-general').
   */
  private buildTopicSectionMap(
    selectedResources: ExternalResourceTask[],
    slugToTopicId: Map<string, string>,
  ): Map<string, { section: SaaCourse['sections'][number]; courseResource: ExternalResourceTask }[]> {
    const topicSectionMap = new Map<
      string,
      { section: SaaCourse['sections'][number]; courseResource: ExternalResourceTask }[]
    >();

    for (const courseData of COURSE_CATALOG) {
      const courseResource = selectedResources.find(
        (r) => (r.type === 'course' || r.type === 'video') && r.title === courseData.resourceTitle,
      );
      if (!courseResource) continue;

      for (const section of courseData.sections) {
        // Use only the primary topic slug (index 0) for scheduling
        const primarySlug = section.topicSlugs[0];
        if (!primarySlug) continue; // skip any section still missing a slug

        const topicId = slugToTopicId.get(primarySlug);
        if (!topicId) continue;

        const existing = topicSectionMap.get(topicId) ?? [];
        existing.push({ section, courseResource });
        topicSectionMap.set(topicId, existing);
      }
    }

    return topicSectionMap;
  }

  private mapExternalResourceTypeToTaskType(resourceType: ExternalResourceType): StudyTaskType {
    switch (resourceType) {
    case 'course':
      return 'course';
    case 'video':
      return 'video';
    case 'docs':
      return 'read';
    case 'practice_test':
      return 'mock_exam';
    }
  }

  private getPreferredSegmentMinutes(taskType: StudyTaskType): number {
    switch (taskType) {
    case 'course':
      return COURSE_SEGMENT_MINUTES;
    case 'video':
      return VIDEO_SEGMENT_MINUTES;
    case 'mock_exam':
      return 90;
    case 'read':
    default:
      return 30;
    }
  }

  private selectDefaultResources(resources: ExternalResourceTask[], dailyHours: number): ExternalResourceTask[] {
    const allDocs = resources.filter((resource) => resource.type === 'docs');
    const resourceGroups = {
      course: resources.filter((resource) => resource.type === 'course'),
      // Topic-scoped docs are always included in full; only global docs are capped by the profile limit.
      topicDocs: allDocs.filter((resource) => resource.topicId !== null),
      globalDocs: allDocs.filter((resource) => resource.topicId === null),
      video: resources.filter((resource) => resource.type === 'video'),
      practice_test: resources.filter((resource) => resource.type === 'practice_test'),
    };

    const profile = dailyHours >= 4
      ? { docs: 2, videos: 2, practiceTests: 2 }
      : dailyHours >= 2
        ? { docs: 4, videos: 3, practiceTests: 2 }
        : { docs: 5, videos: 2, practiceTests: 1 };

    return [
      ...resourceGroups.course.slice(0, 1),
      ...resourceGroups.topicDocs,
      ...resourceGroups.globalDocs.slice(0, profile.docs),
      ...resourceGroups.video.slice(0, profile.videos),
      ...resourceGroups.practice_test.slice(0, profile.practiceTests),
    ];
  }

  private isRequiredSaaCourse(resource: ExternalResourceTask): boolean {
    return (
      resource.type === 'course'
      && resource.title.trim().toLowerCase() === REQUIRED_SAA_COURSE_TITLE.toLowerCase()
    );
  }

  private selectResourcesFromIdsWithRequiredCourse(
    resources: ExternalResourceTask[],
    selectedMaterialIds: string[],
  ): ExternalResourceTask[] {
    const resourceById = new Map(resources.map((r) => [r.id, r]));
    // Preserve the template-defined order from selectedMaterialIds
    const picked = selectedMaterialIds
      .map((id) => resourceById.get(id))
      .filter((r): r is ExternalResourceTask => r !== undefined);
    const requiredCourse = resources.find((resource) => this.isRequiredSaaCourse(resource));

    if (!requiredCourse) return picked;
    if (picked.some((resource) => resource.id === requiredCourse.id)) return picked;

    return [requiredCourse, ...picked];
  }

  private buildScheduleDates(targetDate: string): string[] {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const parsedTarget = new Date(`${targetDate}T00:00:00.000Z`);
    const safeTarget = Number.isNaN(parsedTarget.getTime()) ? today : parsedTarget;
    const end = safeTarget < today ? today : safeTarget;

    const dates: string[] = [];
    const cursor = new Date(today);
    while (cursor <= end) {
      dates.push(toDateString(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  async getMyStudyPlan(userId: string): Promise<PlanRow | null> {
    const [plan] = await this.db
      .select({
        id: schema.studyPlans.id,
        certificationId: schema.studyPlans.certificationId,
        certificationName: schema.certifications.name,
        certificationCode: schema.certifications.code,
        targetDate: schema.studyPlans.targetDate,
        startDate: schema.studyPlans.createdAt,
        dailyHours: schema.studyPlans.dailyHours,
      })
      .from(schema.studyPlans)
      .innerJoin(
        schema.certifications,
        eq(schema.studyPlans.certificationId, schema.certifications.id),
      )
      .where(eq(schema.studyPlans.userId, userId))
      .limit(1);

    return plan ?? null;
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(userId: string): Promise<DashboardResponse> {
    const plan = await this.getMyStudyPlan(userId);

    const emptyStats: DashboardStats = {
      streak: 0,
      topicsCompleted: 0,
      totalTopics: 0,
      completedTasksTotal: 0,
      readinessScore: null,
      quizAccuracy: null,
    };

    if (!plan) {
      return { studyPlan: null, todaysTasks: [], carryOverTasks: [], upcomingTasks: [], stats: emptyStats };
    }

    const today = toDateString(new Date());
    const nextWeek = toDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    // Carry over pending tasks from past days
    await this.db
      .update(schema.studyTasks)
      .set({ status: 'carried_over', updatedAt: new Date() })
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, plan.id),
          eq(schema.studyTasks.status, 'pending'),
          sql`${schema.studyTasks.scheduledDate} < ${today}`,
        ),
      );

    // Generate today's tasks if none exist yet
    await this.generateTodaysTasks(userId, plan, today);

    // Fetch today's tasks + carried-over tasks
    const rawTasks = await this.db
      .select({
        id: schema.studyTasks.id,
        topicId: schema.studyTasks.topicId,
        type: schema.studyTasks.type,
        status: schema.studyTasks.status,
        scheduledDate: schema.studyTasks.scheduledDate,
        topicTitle: schema.topics.title,
        taskTitle: schema.studyTasks.title,
        resourceTitle: schema.externalResources.title,
        externalResourceId: schema.studyTasks.externalResourceId,
        plannedMinutes: schema.studyTasks.plannedMinutes,
        topicResourceUrl: sql<string | null>`(SELECT url FROM external_resources WHERE topic_id = ${schema.studyTasks.topicId} ORDER BY priority DESC LIMIT 1)`,
      })
      .from(schema.studyTasks)
      .leftJoin(schema.topics, eq(schema.studyTasks.topicId, schema.topics.id))
      .leftJoin(
        schema.externalResources,
        eq(schema.studyTasks.externalResourceId, schema.externalResources.id),
      )
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, plan.id),
          or(
            sql`${schema.studyTasks.scheduledDate} = ${today}`,
            eq(schema.studyTasks.status, 'carried_over'),
          ),
        ),
      )
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.sortOrder));

    const todaysTasks: StudyTaskItem[] = [];
    const carryOverTasks: StudyTaskItem[] = [];

    for (const row of rawTasks) {
      const item: StudyTaskItem = {
        id: row.id,
        topicId: row.topicId ?? null,
        type: row.type as StudyTaskItem['type'],
        status: row.status as StudyTaskItem['status'],
        scheduledDate: String(row.scheduledDate),
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
        courseName: row.taskTitle ? (row.resourceTitle ?? null) : null,
        externalResourceId: row.externalResourceId ?? null,
        topicResourceUrl: row.topicResourceUrl ?? null,
        estimatedMinutes: row.plannedMinutes ?? TASK_MINUTES[row.type] ?? 30,
      };
      if (row.status === 'carried_over') {
        carryOverTasks.push(item);
      } else {
        todaysTasks.push(item);
      }
    }

    // Fetch upcoming tasks (next 7 days)
    const rawUpcoming = await this.db
      .select({
        id: schema.studyTasks.id,
        topicId: schema.studyTasks.topicId,
        type: schema.studyTasks.type,
        status: schema.studyTasks.status,
        scheduledDate: schema.studyTasks.scheduledDate,
        topicTitle: schema.topics.title,
        taskTitle: schema.studyTasks.title,
        resourceTitle: schema.externalResources.title,
        externalResourceId: schema.studyTasks.externalResourceId,
        plannedMinutes: schema.studyTasks.plannedMinutes,
        topicResourceUrl: sql<string | null>`(SELECT url FROM external_resources WHERE topic_id = ${schema.studyTasks.topicId} ORDER BY priority DESC LIMIT 1)`,
      })
      .from(schema.studyTasks)
      .leftJoin(schema.topics, eq(schema.studyTasks.topicId, schema.topics.id))
      .leftJoin(
        schema.externalResources,
        eq(schema.studyTasks.externalResourceId, schema.externalResources.id),
      )
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, plan.id),
          eq(schema.studyTasks.status, 'pending'),
          sql`${schema.studyTasks.scheduledDate} > ${today}`,
          sql`${schema.studyTasks.scheduledDate} <= ${nextWeek}`,
        ),
      )
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.sortOrder));

    const upcomingByDate = new Map<string, StudyTaskItem[]>();
    for (const row of rawUpcoming) {
      const dateKey = String(row.scheduledDate);
      const item: StudyTaskItem = {
        id: row.id,
        topicId: row.topicId ?? null,
        type: row.type as StudyTaskItem['type'],
        status: row.status as StudyTaskItem['status'],
        scheduledDate: dateKey,
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
        courseName: row.taskTitle ? (row.resourceTitle ?? null) : null,
        externalResourceId: row.externalResourceId ?? null,
        topicResourceUrl: row.topicResourceUrl ?? null,
        estimatedMinutes: row.plannedMinutes ?? TASK_MINUTES[row.type] ?? 30,
      };
      const existing = upcomingByDate.get(dateKey) ?? [];
      existing.push(item);
      upcomingByDate.set(dateKey, existing);
    }

    const upcomingTasks: UpcomingDay[] = Array.from(upcomingByDate.entries()).map(([date, tasks]) => ({
      date,
      tasks,
    }));

    const stats = await this.computeStats(userId, plan.certificationId, plan.id);

    const studyPlan: DashboardStudyPlan = {
      id: plan.id,
      certificationId: plan.certificationId,
      certificationName: plan.certificationName,
      certificationCode: plan.certificationCode,
      targetDate: String(plan.targetDate),
      startDate: plan.startDate.toISOString().split('T')[0]!,
      dailyHours: plan.dailyHours,
    };

    return { studyPlan, todaysTasks, carryOverTasks, upcomingTasks, stats };
  }

  // ─── Schedule ────────────────────────────────────────────────────────────────

  async getSchedule(userId: string): Promise<PlanScheduleResponse> {
    const plan = await this.getMyStudyPlan(userId);
    if (!plan) return { weeks: [] };

    const rawTasks = await this.db
      .select({
        id: schema.studyTasks.id,
        topicId: schema.studyTasks.topicId,
        type: schema.studyTasks.type,
        status: schema.studyTasks.status,
        scheduledDate: schema.studyTasks.scheduledDate,
        topicTitle: schema.topics.title,
        taskTitle: schema.studyTasks.title,
        resourceTitle: schema.externalResources.title,
        externalResourceId: schema.studyTasks.externalResourceId,
        plannedMinutes: schema.studyTasks.plannedMinutes,
        topicResourceUrl: sql<string | null>`(SELECT url FROM external_resources WHERE topic_id = ${schema.studyTasks.topicId} ORDER BY priority DESC LIMIT 1)`,
      })
      .from(schema.studyTasks)
      .leftJoin(schema.topics, eq(schema.studyTasks.topicId, schema.topics.id))
      .leftJoin(
        schema.externalResources,
        eq(schema.studyTasks.externalResourceId, schema.externalResources.id),
      )
      .where(eq(schema.studyTasks.studyPlanId, plan.id))
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.sortOrder));

    if (rawTasks.length === 0) return { weeks: [] };

    const planStart = new Date(String(rawTasks[0]!.scheduledDate) + 'T00:00:00');
    const weekMap = new Map<number, StudyTaskItem[]>();

    for (const row of rawTasks) {
      const taskDate = new Date(String(row.scheduledDate) + 'T00:00:00');
      const daysDiff = Math.floor((taskDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7) + 1;

      const item: StudyTaskItem = {
        id: row.id,
        topicId: row.topicId ?? null,
        type: row.type as StudyTaskType,
        status: row.status as StudyTaskStatus,
        scheduledDate: String(row.scheduledDate),
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
        courseName: row.taskTitle ? (row.resourceTitle ?? null) : null,
        externalResourceId: row.externalResourceId ?? null,
        topicResourceUrl: row.topicResourceUrl ?? null,
        estimatedMinutes: row.plannedMinutes ?? TASK_MINUTES[row.type] ?? 30,
      };

      const existing = weekMap.get(weekNumber) ?? [];
      existing.push(item);
      weekMap.set(weekNumber, existing);
    }

    const weeks: WeekSchedule[] = Array.from(weekMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([weekNumber, tasks]) => {
        const weekStartMs = planStart.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000;
        const weekEndMs = weekStartMs + 6 * 24 * 60 * 60 * 1000;
        return {
          weekNumber,
          startDate: new Date(weekStartMs).toISOString().split('T')[0]!,
          endDate: new Date(weekEndMs).toISOString().split('T')[0]!,
          tasks,
        };
      });

    return { weeks };
  }

  // ─── Task generation ────────────────────────────────────────────────────────

  private async generateTodaysTasks(
    userId: string,
    plan: PlanRow,
    today: string,
  ): Promise<void> {
    // Course, quiz, and initial flashcard tasks are pre-scheduled by regenerateResourceTasks.
    // This method only adds spaced-repetition flashcard reviews that have become due since the
    // plan was last generated, using whatever budget remains after pre-scheduled tasks.
    const todaysExistingTasks = await this.db
      .select({
        type: schema.studyTasks.type,
        plannedMinutes: schema.studyTasks.plannedMinutes,
      })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, plan.id),
          sql`${schema.studyTasks.scheduledDate} = ${today}`,
        ),
      );

    let budgetRemaining = Math.floor(plan.dailyHours * 60);
    for (const task of todaysExistingTasks) {
      budgetRemaining -= task.plannedMinutes ?? TASK_MINUTES[task.type] ?? 30;
    }

    const flashcardCost = TASK_MINUTES['flashcard']!;
    if (budgetRemaining < flashcardCost) return;

    const dueFlashcards = await this.db
      .select({ topicId: schema.flashcards.topicId })
      .from(schema.reviewSchedules)
      .innerJoin(schema.flashcards, eq(schema.reviewSchedules.flashcardId, schema.flashcards.id))
      .where(
        and(
          eq(schema.reviewSchedules.userId, userId),
          lte(schema.reviewSchedules.nextReviewAt, new Date()),
        ),
      )
      .limit(Math.floor(budgetRemaining / flashcardCost));

    const tasksToInsert: (typeof schema.studyTasks.$inferInsert)[] = [];
    for (const fc of dueFlashcards) {
      if (budgetRemaining < flashcardCost) break;
      tasksToInsert.push({
        studyPlanId: plan.id,
        topicId: fc.topicId,
        type: 'flashcard',
        status: 'pending',
        scheduledDate: today,
        plannedMinutes: flashcardCost,
      });
      budgetRemaining -= flashcardCost;
    }

    if (tasksToInsert.length > 0) {
      try {
        await this.db.insert(schema.studyTasks).values(tasksToInsert);
      } catch (error) {
        // Plan may be deleted concurrently by reset while dashboard is generating tasks.
        if (this.isStudyPlanDeletedFkViolation(error)) return;
        throw error;
      }
    }
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────

  private async computeStats(
    userId: string,
    certificationId: string,
    planId: string,
  ): Promise<DashboardStats> {
    // Streak: consecutive days ending at today with at least one completed task
    const completedDays = await this.db
      .selectDistinct({ date: schema.studyTasks.scheduledDate })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, planId),
          eq(schema.studyTasks.status, 'completed'),
        ),
      )
      .orderBy(desc(schema.studyTasks.scheduledDate));

    let streak = 0;
    for (let i = 0; i < completedDays.length; i++) {
      const rowDateStr = String(completedDays[i]!.date);
      const expected = new Date();
      expected.setUTCDate(expected.getUTCDate() - i);
      const expectedStr = toDateString(expected);
      if (rowDateStr === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    // Topics completed vs total
    const [topicsCompletedRow] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.userTopicStatus)
      .innerJoin(schema.topics, eq(schema.userTopicStatus.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(
        and(
          eq(schema.userTopicStatus.userId, userId),
          eq(schema.domains.certificationId, certificationId),
          eq(schema.userTopicStatus.status, 'completed'),
        ),
      );

    const [totalTopicsRow] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.topics)
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(eq(schema.domains.certificationId, certificationId));

    // Latest readiness score
    const [readinessRow] = await this.db
      .select({ score: schema.readinessScores.score })
      .from(schema.readinessScores)
      .where(
        and(
          eq(schema.readinessScores.userId, userId),
          eq(schema.readinessScores.certificationId, certificationId),
        ),
      )
      .orderBy(desc(schema.readinessScores.calculatedAt))
      .limit(1);

    // Overall quiz accuracy
    const [quizRow] = await this.db
      .select({
        accuracy: sql<number>`AVG(CASE WHEN ${schema.quizAttempts.isCorrect} THEN 1.0 ELSE 0.0 END)`,
      })
      .from(schema.quizAttempts)
      .where(eq(schema.quizAttempts.userId, userId));

    // Total completed tasks across the whole plan lifetime
    const [completedTasksRow] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, planId),
          eq(schema.studyTasks.status, 'completed'),
        ),
      );

    return {
      streak,
      topicsCompleted: Number(topicsCompletedRow?.count ?? 0),
      totalTopics: Number(totalTopicsRow?.count ?? 0),
      completedTasksTotal: Number(completedTasksRow?.count ?? 0),
      readinessScore: readinessRow?.score ?? null,
      quizAccuracy: quizRow?.accuracy != null ? Number(quizRow.accuracy) : null,
    };
  }

  // ─── Task status update ─────────────────────────────────────────────────────

  async updateTaskStatus(
    userId: string,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ): Promise<{ id: string; status: string }> {
    const [task] = await this.db
      .select({
        id: schema.studyTasks.id,
        ownerId: schema.studyPlans.userId,
      })
      .from(schema.studyTasks)
      .innerJoin(schema.studyPlans, eq(schema.studyTasks.studyPlanId, schema.studyPlans.id))
      .where(eq(schema.studyTasks.id, taskId))
      .limit(1);

    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Access denied');

    const [updated] = await this.db
      .update(schema.studyTasks)
      .set({
        status: dto.status,
        completedAt: dto.status === 'completed' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.studyTasks.id, taskId))
      .returning({ id: schema.studyTasks.id, status: schema.studyTasks.status });

    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  // ─── Task reschedule ────────────────────────────────────────────────────────

  async rescheduleTask(
    userId: string,
    taskId: string,
    dto: RescheduleTaskDto,
  ): Promise<{ id: string; scheduledDate: string; upcomingTasks: UpcomingDay[] }> {
    const [task] = await this.db
      .select({
        id: schema.studyTasks.id,
        ownerId: schema.studyPlans.userId,
        studyPlanId: schema.studyTasks.studyPlanId,
        type: schema.studyTasks.type,
        title: schema.studyTasks.title,
      })
      .from(schema.studyTasks)
      .innerJoin(schema.studyPlans, eq(schema.studyTasks.studyPlanId, schema.studyPlans.id))
      .where(eq(schema.studyTasks.id, taskId))
      .limit(1);

    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Access denied');

    const [updated] = await this.db
      .update(schema.studyTasks)
      .set({
        scheduledDate: dto.targetDate,
        status: 'pending',
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.studyTasks.id, taskId))
      .returning({ id: schema.studyTasks.id, scheduledDate: schema.studyTasks.scheduledDate });

    if (!updated) throw new NotFoundException('Task not found');

    const isFinalMockExamTask = task.type === 'mock_exam' && task.title === FINAL_MOCK_EXAM_TITLE;
    if (!isFinalMockExamTask) {
      // Compact gaps: shift remaining pending tasks forward to fill any empty days
      await this.compactFutureSchedule(task.studyPlanId);
    }

    const upcomingTasks = await this.fetchUpcomingTasks(task.studyPlanId);
    return { id: updated.id, scheduledDate: String(updated.scheduledDate), upcomingTasks };
  }

  private async compactFutureSchedule(studyPlanId: string): Promise<void> {
    const today = toDateString(new Date());

    const allPending = await this.db
      .select({
        id: schema.studyTasks.id,
        scheduledDate: schema.studyTasks.scheduledDate,
        type: schema.studyTasks.type,
        title: schema.studyTasks.title,
      })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, studyPlanId),
          eq(schema.studyTasks.status, 'pending'),
          sql`${schema.studyTasks.scheduledDate} > ${today}`,
        ),
      )
      .orderBy(asc(schema.studyTasks.scheduledDate));

    if (allPending.length === 0) return;

    const finalMockTask = allPending.find(
      (task) => task.type === 'mock_exam' && task.title === FINAL_MOCK_EXAM_TITLE,
    );
    const sortablePending = finalMockTask
      ? allPending.filter((task) => task.id !== finalMockTask.id)
      : allPending;

    if (sortablePending.length === 0) {
      return;
    }

    // Group task IDs by their current scheduled date
    const byDate = new Map<string, string[]>();
    for (const t of sortablePending) {
      const d = String(t.scheduledDate);
      const arr = byDate.get(d) ?? [];
      arr.push(t.id);
      byDate.set(d, arr);
    }

    // Assign consecutive dates starting from tomorrow, removing any empty-day gaps
    const sortedDates = [...byDate.keys()].sort();
    const cursor = new Date();
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    cursor.setUTCHours(0, 0, 0, 0);

    for (const originalDate of sortedDates) {
      const newDate = toDateString(cursor);
      if (originalDate !== newDate) {
        await this.db
          .update(schema.studyTasks)
          .set({ scheduledDate: newDate, updatedAt: new Date() })
          .where(inArray(schema.studyTasks.id, byDate.get(originalDate)!));
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    if (finalMockTask) {
      const finalDate = toDateString(cursor);
      if (String(finalMockTask.scheduledDate) !== finalDate) {
        await this.db
          .update(schema.studyTasks)
          .set({ scheduledDate: finalDate, updatedAt: new Date() })
          .where(eq(schema.studyTasks.id, finalMockTask.id));
      }
    }
  }

  private async fetchUpcomingTasks(studyPlanId: string): Promise<UpcomingDay[]> {
    const today = toDateString(new Date());
    const nextWeek = toDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const rawUpcoming = await this.db
      .select({
        id: schema.studyTasks.id,
        topicId: schema.studyTasks.topicId,
        type: schema.studyTasks.type,
        status: schema.studyTasks.status,
        scheduledDate: schema.studyTasks.scheduledDate,
        topicTitle: schema.topics.title,
        taskTitle: schema.studyTasks.title,
        resourceTitle: schema.externalResources.title,
        externalResourceId: schema.studyTasks.externalResourceId,
        plannedMinutes: schema.studyTasks.plannedMinutes,
        topicResourceUrl: sql<string | null>`(SELECT url FROM external_resources WHERE topic_id = ${schema.studyTasks.topicId} ORDER BY priority DESC LIMIT 1)`,
      })
      .from(schema.studyTasks)
      .leftJoin(schema.topics, eq(schema.studyTasks.topicId, schema.topics.id))
      .leftJoin(schema.externalResources, eq(schema.studyTasks.externalResourceId, schema.externalResources.id))
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, studyPlanId),
          eq(schema.studyTasks.status, 'pending'),
          sql`${schema.studyTasks.scheduledDate} > ${today}`,
          sql`${schema.studyTasks.scheduledDate} <= ${nextWeek}`,
        ),
      )
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.sortOrder));

    const upcomingByDate = new Map<string, StudyTaskItem[]>();
    for (const row of rawUpcoming) {
      const dateKey = String(row.scheduledDate);
      const item: StudyTaskItem = {
        id: row.id,
        topicId: row.topicId ?? null,
        type: row.type as StudyTaskType,
        status: row.status as StudyTaskStatus,
        scheduledDate: dateKey,
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
        courseName: row.taskTitle ? (row.resourceTitle ?? null) : null,
        externalResourceId: row.externalResourceId ?? null,
        topicResourceUrl: row.topicResourceUrl ?? null,
        estimatedMinutes: row.plannedMinutes ?? TASK_MINUTES[row.type] ?? 30,
      };
      const existing = upcomingByDate.get(dateKey) ?? [];
      existing.push(item);
      upcomingByDate.set(dateKey, existing);
    }

    return Array.from(upcomingByDate.entries()).map(([date, tasks]) => ({ date, tasks }));
  }

  // ─── Study Plan Reset ──────────────────────────────────────────────────────

  async resetStudyPlan(userId: string): Promise<{ message: string }> {
    const plans = await this.db
      .select({ id: schema.studyPlans.id })
      .from(schema.studyPlans)
      .where(eq(schema.studyPlans.userId, userId));

    if (plans.length === 0) throw new NotFoundException('No study plan found');

    const planIds = plans.map((plan) => plan.id);

    // Delete all tasks that belong to any of the user's study plans
    await this.db
      .delete(schema.studyTasks)
      .where(inArray(schema.studyTasks.studyPlanId, planIds));

    // Delete all study plans for the user
    await this.db
      .delete(schema.studyPlans)
      .where(eq(schema.studyPlans.userId, userId));

    return {
      message: 'Study plan has been deleted. Please create a new one.',
    };
  }
}
