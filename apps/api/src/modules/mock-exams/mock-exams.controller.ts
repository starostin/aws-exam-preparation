import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type {
  CompleteMockExamAttemptResponse,
  MockExamAttemptHistoryItem,
  MockExamStatsResponse,
  MockExamAttemptProgressResponse,
  MockExamQuestionsPageResponse,
  MockExamSummary,
  ResetMockExamStatsResponse,
  StartMockExamAttemptResponse,
  SubmitMockExamAnswerResponse,
} from '@aws-exam-prep/types';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { ListAttemptHistoryDto } from './dto/list-attempt-history.dto';
import { ListAttemptQuestionsDto } from './dto/list-attempt-questions.dto';
import { ListMockExamsDto } from './dto/list-mock-exams.dto';
import { SubmitMockExamAnswerDto } from './dto/submit-mock-exam-answer.dto';
import { MockExamsService } from './mock-exams.service';

@Controller({ path: 'mock-exams', version: '1' })
@UseGuards(AuthGuard)
export class MockExamsController {
  constructor(private readonly mockExamsService: MockExamsService) {}

  @Get()
  async listMockExams(@Query() query: ListMockExamsDto): Promise<MockExamSummary[]> {
    return await this.mockExamsService.listMockExams(query.certificationId);
  }

  @Get('attempts/history')
  async listAttemptHistory(
    @CurrentUser() user: AuthUser,
    @Query() query: ListAttemptHistoryDto,
  ): Promise<MockExamAttemptHistoryItem[]> {
    return await this.mockExamsService.listAttemptHistory(user.id, query.certificationId);
  }

  @Post(':mockExamId/attempts')
  async startAttempt(
    @CurrentUser() user: AuthUser,
    @Param('mockExamId') mockExamId: string,
  ): Promise<StartMockExamAttemptResponse> {
    return await this.mockExamsService.startAttempt(user.id, mockExamId);
  }

  @Get('attempts/:attemptId')
  async getAttempt(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
  ): Promise<MockExamAttemptProgressResponse> {
    return await this.mockExamsService.getAttemptProgress(user.id, attemptId);
  }

  @Get('attempts/:attemptId/questions')
  async listAttemptQuestions(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
    @Query() query: ListAttemptQuestionsDto,
  ): Promise<MockExamQuestionsPageResponse> {
    return await this.mockExamsService.listAttemptQuestions(user.id, attemptId, query);
  }

  @Post('attempts/:attemptId/answers')
  async submitAnswer(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitMockExamAnswerDto,
  ): Promise<SubmitMockExamAnswerResponse> {
    return await this.mockExamsService.submitAnswer(user.id, attemptId, dto);
  }

  @Post('attempts/:attemptId/complete')
  async completeAttempt(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
  ): Promise<CompleteMockExamAttemptResponse> {
    return await this.mockExamsService.completeAttempt(user.id, attemptId);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: AuthUser): Promise<MockExamStatsResponse> {
    return await this.mockExamsService.getStats(user.id);
  }

  @Patch('stats/reset')
  async resetStats(@CurrentUser() user: AuthUser): Promise<ResetMockExamStatsResponse> {
    return await this.mockExamsService.resetStats(user.id);
  }
}
