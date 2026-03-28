import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, inArray, lte, or, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';
import type { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import type { RescheduleTaskDto } from './dto/reschedule-task.dto';
import type { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { SAA_STUDY_PLANS } from '../../database/seeds/data/saa-c03-study-plans';

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
  type: StudyTaskType;
  status: StudyTaskStatus;
  scheduledDate: string;
  topicTitle: string | null;
  title: string | null;
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
  quiz: 20,
  review: 15,
  flashcard: 15,
  mock_exam: 90,
  course: 90,
  video: 45,
};

const COURSE_SEGMENT_MINUTES = 90;
const VIDEO_SEGMENT_MINUTES = 45;
const MIN_SEGMENT_MINUTES = 20;
const MIN_MIXED_ACTIVITY_MINUTES = 30;
const RESOURCE_BUDGET_RATIO = 0.65;
const REQUIRED_SAA_COURSE_TITLE = 'Ultimate SAA-C03 Course by Stephane Maarek';

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export type PlanRow = {
  id: string;
  certificationId: string;
  certificationName: string;
  certificationCode: string;
  targetDate: string;
  dailyHours: number;
};

type ExternalResourceTask = {
  id: string;
  title: string;
  type: ExternalResourceType;
  priority: number;
  estimatedMinutes: number | null;
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
    const completedRows = await this.db
      .select({
        externalResourceId: schema.studyTasks.externalResourceId,
        minutes: sql<number>`SUM(COALESCE(${schema.studyTasks.plannedMinutes}, 0))`,
      })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, studyPlanId),
          sql`${schema.studyTasks.externalResourceId} IS NOT NULL`,
          eq(schema.studyTasks.status, 'completed'),
        ),
      )
      .groupBy(schema.studyTasks.externalResourceId);

    const completedMinutesByResource = new Map<string, number>();
    for (const row of completedRows) {
      if (!row.externalResourceId) continue;
      completedMinutesByResource.set(row.externalResourceId, Number(row.minutes ?? 0));
    }

    await this.db
      .delete(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, studyPlanId),
          sql`${schema.studyTasks.externalResourceId} IS NOT NULL`,
          inArray(schema.studyTasks.status, ['pending', 'in_progress', 'carried_over']),
        ),
      );

    const resources = await this.db
      .select({
        id: schema.externalResources.id,
        title: schema.externalResources.title,
        type: schema.externalResources.type,
        priority: schema.externalResources.priority,
        estimatedMinutes: schema.externalResources.estimatedMinutes,
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

    const normalizedResources = resources
      .filter((resource): resource is ExternalResourceTask =>
        resource.type === 'course'
        || resource.type === 'video'
        || resource.type === 'docs'
        || resource.type === 'practice_test',
      );

    if (normalizedResources.length === 0) return;

    const selectedResources = selectedMaterialIds?.length
      ? this.selectResourcesFromIdsWithRequiredCourse(normalizedResources, selectedMaterialIds)
      : this.selectDefaultResources(normalizedResources, dailyHours);

    if (selectedResources.length === 0) return;

    const scheduleDates = this.buildScheduleDates(targetDate);
    if (scheduleDates.length === 0) return;

    const dayBudgetMinutes = Math.max(MIN_SEGMENT_MINUTES, Math.floor(dailyHours * 60));
    const baseResourceBudget = Math.max(
      MIN_SEGMENT_MINUTES,
      Math.floor(dayBudgetMinutes * RESOURCE_BUDGET_RATIO),
    );
    const resourceDayBudget = dayBudgetMinutes > MIN_SEGMENT_MINUTES + MIN_MIXED_ACTIVITY_MINUTES
      ? Math.min(baseResourceBudget, dayBudgetMinutes - MIN_MIXED_ACTIVITY_MINUTES)
      : baseResourceBudget;

    const remainingMinutesByDate = new Map<string, number>(
      scheduleDates.map((date) => [date, resourceDayBudget]),
    );

    const tasksToInsert: (typeof schema.studyTasks.$inferInsert)[] = [];

    for (const resource of selectedResources) {
      const taskType = this.mapExternalResourceTypeToTaskType(resource.type);
      const defaultMinutes = TASK_MINUTES[taskType] ?? 30;
      const estimatedMinutes = resource.estimatedMinutes ?? defaultMinutes;
      const completedMinutes = completedMinutesByResource.get(resource.id) ?? 0;
      let remainingResourceMinutes = Math.max(estimatedMinutes - completedMinutes, 0);
      if (remainingResourceMinutes <= 0) continue;

      const preferredSegmentMinutes = this.getPreferredSegmentMinutes(taskType);
      const shouldSplit = remainingResourceMinutes > preferredSegmentMinutes;
      let segmentIndex = 1;
      let dateCursor = 0;

      while (remainingResourceMinutes > 0) {
        while (
          dateCursor < scheduleDates.length
          && (remainingMinutesByDate.get(scheduleDates[dateCursor]!) ?? 0) < MIN_SEGMENT_MINUTES
        ) {
          dateCursor++;
        }

        if (dateCursor >= scheduleDates.length) break;

        const scheduledDate = scheduleDates[dateCursor]!;
        const remainingDayMinutes = remainingMinutesByDate.get(scheduledDate) ?? 0;
        let chunkMinutes = Math.min(
          remainingResourceMinutes,
          preferredSegmentMinutes,
          remainingDayMinutes,
        );

        if (
          chunkMinutes < MIN_SEGMENT_MINUTES
          && remainingResourceMinutes > chunkMinutes
          && dateCursor < scheduleDates.length - 1
        ) {
          dateCursor++;
          continue;
        }

        chunkMinutes = Math.max(MIN_SEGMENT_MINUTES, chunkMinutes);
        chunkMinutes = Math.min(chunkMinutes, remainingResourceMinutes, remainingDayMinutes);
        if (chunkMinutes <= 0) {
          dateCursor++;
          continue;
        }

        tasksToInsert.push({
          studyPlanId,
          externalResourceId: resource.id,
          title: shouldSplit ? `${resource.title} (Part ${segmentIndex})` : resource.title,
          type: taskType,
          status: 'pending',
          scheduledDate,
          plannedMinutes: chunkMinutes,
        });

        remainingResourceMinutes -= chunkMinutes;
        remainingMinutesByDate.set(scheduledDate, Math.max(remainingDayMinutes - chunkMinutes, 0));
        segmentIndex++;

        // Keep split resources spread across days so users don't get multiple parts on the same date.
        if (shouldSplit || (remainingMinutesByDate.get(scheduledDate) ?? 0) < MIN_SEGMENT_MINUTES) {
          dateCursor++;
        }
      }
    }

    if (tasksToInsert.length === 0) return;
    await this.db.insert(schema.studyTasks).values(tasksToInsert);
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
    const resourceGroups = {
      course: resources.filter((resource) => resource.type === 'course'),
      docs: resources.filter((resource) => resource.type === 'docs'),
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
      ...resourceGroups.docs.slice(0, profile.docs),
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
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.type));

    const todaysTasks: StudyTaskItem[] = [];
    const carryOverTasks: StudyTaskItem[] = [];

    for (const row of rawTasks) {
      const item: StudyTaskItem = {
        id: row.id,
        type: row.type as StudyTaskItem['type'],
        status: row.status as StudyTaskItem['status'],
        scheduledDate: String(row.scheduledDate),
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
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
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.type));

    const upcomingByDate = new Map<string, StudyTaskItem[]>();
    for (const row of rawUpcoming) {
      const dateKey = String(row.scheduledDate);
      const item: StudyTaskItem = {
        id: row.id,
        type: row.type as StudyTaskItem['type'],
        status: row.status as StudyTaskItem['status'],
        scheduledDate: dateKey,
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
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
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.type), asc(schema.studyTasks.createdAt));

    if (rawTasks.length === 0) return { weeks: [] };

    const planStart = new Date(String(rawTasks[0]!.scheduledDate) + 'T00:00:00');
    const weekMap = new Map<number, StudyTaskItem[]>();

    for (const row of rawTasks) {
      const taskDate = new Date(String(row.scheduledDate) + 'T00:00:00');
      const daysDiff = Math.floor((taskDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7) + 1;

      const item: StudyTaskItem = {
        id: row.id,
        type: row.type as StudyTaskType,
        status: row.status as StudyTaskStatus,
        scheduledDate: String(row.scheduledDate),
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
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
    const existing = await this.db
      .select({ id: schema.studyTasks.id })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, plan.id),
          sql`${schema.studyTasks.scheduledDate} = ${today}`,
        ),
      )
      .limit(1);

    const todaysExistingTasks = await this.db
      .select({
        id: schema.studyTasks.id,
        topicId: schema.studyTasks.topicId,
        type: schema.studyTasks.type,
        externalResourceId: schema.studyTasks.externalResourceId,
        plannedMinutes: schema.studyTasks.plannedMinutes,
      })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, plan.id),
          sql`${schema.studyTasks.scheduledDate} = ${today}`,
        ),
      );

    if (existing.length === 0 && todaysExistingTasks.length === 0) {
      // no-op, the generation below will create the first tasks for the day
    }

    const hasNonResourceTaskForToday = todaysExistingTasks.some((task) => !task.externalResourceId);
    if (hasNonResourceTaskForToday) return;

    let budgetMinutes = Math.floor(plan.dailyHours * 60);
    for (const task of todaysExistingTasks) {
      budgetMinutes -= task.plannedMinutes ?? TASK_MINUTES[task.type] ?? 30;
    }

    if (budgetMinutes < MIN_SEGMENT_MINUTES) return;

    const tasksToInsert: (typeof schema.studyTasks.$inferInsert)[] = [];
    const existingTopicTypeKeys = new Set<string>(
      todaysExistingTasks
        .filter((task): task is typeof task & { topicId: string } => Boolean(task.topicId))
        .map((task) => `${task.topicId}:${task.type}`),
    );

    const tryAddTopicTask = (topicId: string, type: StudyTaskType): boolean => {
      const key = `${topicId}:${type}`;
      if (existingTopicTypeKeys.has(key)) return false;
      const cost = TASK_MINUTES[type] ?? 30;
      if (budgetMinutes < cost) return false;

      tasksToInsert.push({
        studyPlanId: plan.id,
        topicId,
        type,
        status: 'pending',
        scheduledDate: today,
      });
      budgetMinutes -= cost;
      existingTopicTypeKeys.add(key);
      return true;
    };

    const weakTopicIds = await this.getWeakTopicIds(userId);
    const priorityScoreByTopic = await this.getPriorityTopicScores(plan.certificationId);

    const topicsWithStatus = await this.db
      .select({
        topicId: schema.topics.id,
        domainWeight: schema.domains.weightPercent,
        userStatus: schema.userTopicStatus.status,
      })
      .from(schema.topics)
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .leftJoin(
        schema.userTopicStatus,
        and(
          eq(schema.userTopicStatus.topicId, schema.topics.id),
          eq(schema.userTopicStatus.userId, userId),
        ),
      )
      .where(eq(schema.domains.certificationId, plan.certificationId));

    const statusOrder: Record<string, number> = { not_started: 0, in_progress: 1, completed: 2 };

    const sortedTopics = [...topicsWithStatus].sort((a, b) => {
      const aStatus = a.userStatus ?? 'not_started';
      const bStatus = b.userStatus ?? 'not_started';
      const statusDiff = (statusOrder[aStatus] ?? 0) - (statusOrder[bStatus] ?? 0);
      if (statusDiff !== 0) return statusDiff;
      return b.domainWeight - a.domainWeight;
    });

    const prioritizedToday = new Set<string>();
    const prioritySortedTopics = [...sortedTopics].sort((a, b) => {
      const aScore = priorityScoreByTopic.get(a.topicId) ?? Number.MIN_SAFE_INTEGER;
      const bScore = priorityScoreByTopic.get(b.topicId) ?? Number.MIN_SAFE_INTEGER;
      if (aScore !== bScore) return bScore - aScore;
      return b.domainWeight - a.domainWeight;
    });

    // Top priority: schedule topics backed by higher-priority study materials first.
    for (const topic of prioritySortedTopics) {
      if (budgetMinutes <= 0) break;
      if (!priorityScoreByTopic.has(topic.topicId)) continue;

      const status = topic.userStatus ?? 'not_started';
      if (status === 'completed') continue;

      const type: StudyTaskType = status === 'in_progress' ? 'review' : 'read';
      if (tryAddTopicTask(topic.topicId, type)) {
        prioritizedToday.add(topic.topicId);
      }
    }

    // Weak-area review tasks first
    for (const topic of sortedTopics) {
      if (budgetMinutes <= 0) break;
      if (prioritizedToday.has(topic.topicId)) continue;
      if (!weakTopicIds.has(topic.topicId)) continue;
      tryAddTopicTask(topic.topicId, 'review');
    }

    // Read + quiz for not-started, review for in-progress
    for (const topic of sortedTopics) {
      if (budgetMinutes <= 0) break;
      if (prioritizedToday.has(topic.topicId)) continue;
      const status = topic.userStatus ?? 'not_started';
      if (status === 'completed') continue;
      if (weakTopicIds.has(topic.topicId)) continue;

      if (status === 'not_started') {
        tryAddTopicTask(topic.topicId, 'read');
        tryAddTopicTask(topic.topicId, 'quiz');
      } else if (status === 'in_progress') {
        tryAddTopicTask(topic.topicId, 'review');
      }
    }

    // Due flashcard reviews
    const flashcardCost = TASK_MINUTES['flashcard']!;
    if (budgetMinutes >= flashcardCost) {
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
        .limit(Math.floor(budgetMinutes / flashcardCost));

      for (const fc of dueFlashcards) {
        if (budgetMinutes < flashcardCost) break;
        tasksToInsert.push({ studyPlanId: plan.id, topicId: fc.topicId, type: 'flashcard', status: 'pending', scheduledDate: today });
        budgetMinutes -= flashcardCost;
      }
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

  private async getWeakTopicIds(userId: string): Promise<Set<string>> {
    const rows = await this.db
      .select({
        topicId: schema.quizQuestions.topicId,
        correctCount: sql<number>`SUM(CASE WHEN ${schema.quizAttempts.isCorrect} THEN 1 ELSE 0 END)`,
        totalCount: sql<number>`COUNT(*)`,
      })
      .from(schema.quizAttempts)
      .innerJoin(schema.quizQuestions, eq(schema.quizAttempts.questionId, schema.quizQuestions.id))
      .where(eq(schema.quizAttempts.userId, userId))
      .groupBy(schema.quizQuestions.topicId);

    const weak = new Set<string>();
    for (const row of rows) {
      const accuracy = row.totalCount > 0 ? row.correctCount / row.totalCount : 0;
      if (accuracy < 0.7) weak.add(row.topicId);
    }
    return weak;
  }

  private async getPriorityTopicScores(certificationId: string): Promise<Map<string, number>> {
    const resources = await this.db
      .select({
        topicId: schema.externalResources.topicId,
        priority: schema.externalResources.priority,
      })
      .from(schema.externalResources)
      .where(
        and(
          eq(schema.externalResources.certificationId, certificationId),
          sql`${schema.externalResources.topicId} IS NOT NULL`,
        ),
      );

    const priorityScores = new Map<string, number>();
    for (const resource of resources) {
      if (!resource.topicId) continue;
      const currentScore = priorityScores.get(resource.topicId);
      if (currentScore == null || resource.priority > currentScore) {
        priorityScores.set(resource.topicId, resource.priority);
      }
    }

    return priorityScores;
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

    return {
      streak,
      topicsCompleted: Number(topicsCompletedRow?.count ?? 0),
      totalTopics: Number(totalTopicsRow?.count ?? 0),
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

    // Compact gaps: shift remaining pending tasks forward to fill any empty days
    await this.compactFutureSchedule(task.studyPlanId);

    const upcomingTasks = await this.fetchUpcomingTasks(task.studyPlanId);
    return { id: updated.id, scheduledDate: String(updated.scheduledDate), upcomingTasks };
  }

  private async compactFutureSchedule(studyPlanId: string): Promise<void> {
    const today = toDateString(new Date());

    const allPending = await this.db
      .select({ id: schema.studyTasks.id, scheduledDate: schema.studyTasks.scheduledDate })
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

    // Group task IDs by their current scheduled date
    const byDate = new Map<string, string[]>();
    for (const t of allPending) {
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
  }

  private async fetchUpcomingTasks(studyPlanId: string): Promise<UpcomingDay[]> {
    const today = toDateString(new Date());
    const nextWeek = toDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const rawUpcoming = await this.db
      .select({
        id: schema.studyTasks.id,
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
      .orderBy(asc(schema.studyTasks.scheduledDate), asc(schema.studyTasks.type));

    const upcomingByDate = new Map<string, StudyTaskItem[]>();
    for (const row of rawUpcoming) {
      const dateKey = String(row.scheduledDate);
      const item: StudyTaskItem = {
        id: row.id,
        type: row.type as StudyTaskType,
        status: row.status as StudyTaskStatus,
        scheduledDate: dateKey,
        topicTitle: row.topicTitle ?? null,
        title: row.taskTitle ?? row.resourceTitle ?? row.topicTitle ?? null,
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
