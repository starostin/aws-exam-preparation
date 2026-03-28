import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import { RescheduleTaskDto } from './dto/reschedule-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { StudyPlansService, type DashboardResponse, type PlanRow, type PlanScheduleResponse, type StudyPlanTemplate, type UpcomingDay } from './study-plans.service';

@Controller({ path: 'study-plans', version: '1' })
@UseGuards(AuthGuard)
export class StudyPlansController {
  constructor(private readonly studyPlansService: StudyPlansService) {}

  @Get('certifications')
  async getCertifications(): Promise<{ id: string; code: string; name: string; provider: string }[]> {
    return this.studyPlansService.getCertifications();
  }

  @Get('templates')
  async getTemplates(): Promise<StudyPlanTemplate[]> {
    return this.studyPlansService.getStudyPlanTemplates();
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateStudyPlanDto,
  ): Promise<{ id: string }> {
    return this.studyPlansService.createStudyPlan(user.id, dto);
  }

  @Get('me')
  async getMine(@CurrentUser() user: AuthUser): Promise<PlanRow> {
    const plan = await this.studyPlansService.getMyStudyPlan(user.id);
    if (!plan) throw new NotFoundException('No study plan found');
    return plan;
  }

  @Get('me/dashboard')
  async getDashboard(@CurrentUser() user: AuthUser): Promise<DashboardResponse> {
    console.log('-=as-as-as0-as0-');
    
    return this.studyPlansService.getDashboard(user.id);
  }

  @Get('me/schedule')
  async getSchedule(@CurrentUser() user: AuthUser): Promise<PlanScheduleResponse> {
    return this.studyPlansService.getSchedule(user.id);
  }

  @Patch('me/reset')
  async resetStudyPlan(
    @CurrentUser() user: AuthUser,
  ): Promise<{ message: string }> {
    return this.studyPlansService.resetStudyPlan(user.id);
  }

  @Patch('tasks/:taskId/reschedule')
  async rescheduleTask(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: RescheduleTaskDto,
  ): Promise<{ id: string; scheduledDate: string; upcomingTasks: UpcomingDay[] }> {
    return this.studyPlansService.rescheduleTask(user.id, taskId, dto);
  }

  @Patch('tasks/:taskId')
  async updateTaskStatus(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ): Promise<{ id: string; status: string }> {
    return this.studyPlansService.updateTaskStatus(user.id, taskId, dto);
  }
}
