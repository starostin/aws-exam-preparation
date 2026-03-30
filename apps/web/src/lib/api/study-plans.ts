import { apiClient } from './client';
import type { CreateStudyPlanInput, DashboardResponse, PlanScheduleResponse, RescheduleTaskInput, UpdateTaskStatusInput, UpcomingDay } from '@aws-exam-prep/types';

export interface CertificationItem {
  id: string;
  code: string;
  name: string;
  provider: string;
}

export interface StudyMaterialItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  priority: number;
  isFree: boolean;
  provider: string | null;
  level: string | null;
  tags: string[];
  estimatedMinutes: number | null;
  topicTitle: string | null;
  domainName: string | null;
}

export async function fetchCertifications(token: string): Promise<CertificationItem[]> {
  return apiClient.get<CertificationItem[]>('/v1/study-plans/certifications', { token });
}

export async function fetchDashboard(token: string): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>('/v1/study-plans/me/dashboard', { token });
}

export async function fetchPlanSchedule(token: string): Promise<PlanScheduleResponse> {
  return apiClient.get<PlanScheduleResponse>('/v1/study-plans/me/schedule', { token });
}

export async function fetchStudyMaterials(
  certificationId: string,
  token: string,
): Promise<StudyMaterialItem[]> {
  const queryParams = new URLSearchParams({ certificationId });
  return apiClient.get<StudyMaterialItem[]>(`/v1/materials?${queryParams.toString()}`, { token });
}

export async function createStudyPlan(input: CreateStudyPlanInput, token: string): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>('/v1/study-plans', input, { token });
}

export interface PreviewDetailsSummary {
  totals: { flashcards: number; quizzes: number; mockExams: number; practiceTests: number };
  weeksSummary: {
    weekNumber: number;
    startDate: string;
    endDate: string;
    description: string;
    flashcards: number;
    quizzes: number;
    mockExams: number;
    practiceTests: number;
    materials: { externalResourceId: string; title: string; type: string }[];
  }[];
}

export async function previewSchedule(input: CreateStudyPlanInput, token: string): Promise<PreviewDetailsSummary> {
  return apiClient.post<PreviewDetailsSummary>('/v1/study-plans/preview', input, { token });
}

export async function resetStudyPlan(token: string): Promise<{ message: string }> {
  return apiClient.patch<{ message: string }>('/v1/study-plans/me/reset', {}, { token });
}

export async function updateTaskStatus(
  taskId: string,
  input: UpdateTaskStatusInput,
  token: string,
): Promise<void> {
  await apiClient.patch<unknown>(`/v1/study-plans/tasks/${taskId}`, input, { token });
}

export async function rescheduleTask(
  taskId: string,
  input: RescheduleTaskInput,
  token: string,
): Promise<{ id: string; scheduledDate: string; upcomingTasks: UpcomingDay[] }> {
  return apiClient.patch<{ id: string; scheduledDate: string; upcomingTasks: UpcomingDay[] }>(
    `/v1/study-plans/tasks/${taskId}/reschedule`,
    input,
    { token },
  );
}

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
  selectedMaterialIds: string[];
  phases: StudyPlanTemplatePhase[];
}

export async function fetchStudyPlanTemplates(token: string): Promise<StudyPlanTemplate[]> {
  return apiClient.get<StudyPlanTemplate[]>('/v1/study-plans/templates', { token });
}
