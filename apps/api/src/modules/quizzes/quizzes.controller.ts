import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type {
  CompleteQuizAttemptResponse,
  ResetQuizStatsResponse,
  QuizAttemptProgressResponse,
  QuizAttemptQuestionsPageResponse,
  QuizAttemptSummary,
  QuizQuestionItem,
  QuizStatsResponse,
  QuizTopicSummary,
  StartQuizAttemptResponse,
  SubmitQuizAnswerResponse,
  SubmitQuizAttemptResponse,
} from '@aws-exam-prep/types';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { ListQuizAttemptHistoryDto } from './dto/list-quiz-attempt-history.dto';
import { ListQuizAttemptQuestionsDto } from './dto/list-quiz-attempt-questions.dto';
import { ListQuizQuestionsDto } from './dto/list-quiz-questions.dto';
import { QuizStatsQueryDto } from './dto/quiz-stats-query.dto';
import { QuizTopicsQueryDto } from './dto/quiz-topics-query.dto';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAnswerDto } from './dto/submit-quiz-answer.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizzesService } from './quizzes.service';

@Controller({ path: 'quizzes', version: '1' })
@UseGuards(AuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('topics')
  async listTopics(@Query() query: QuizTopicsQueryDto): Promise<QuizTopicSummary[]> {
    return this.quizzesService.listTopics(query.certificationId);
  }

  @Get('questions')
  async listQuestions(
    @CurrentUser() user: AuthUser,
    @Query() query: ListQuizQuestionsDto,
  ): Promise<QuizQuestionItem[]> {
    return this.quizzesService.listQuestions(user.id, query);
  }

  @Get('attempts/history')
  async listAttemptHistory(
    @CurrentUser() user: AuthUser,
    @Query() query: ListQuizAttemptHistoryDto,
  ): Promise<QuizAttemptSummary[]> {
    return this.quizzesService.listAttemptHistory(user.id, query);
  }

  @Post('attempts/start')
  async startAttempt(
    @CurrentUser() user: AuthUser,
    @Body() dto: StartQuizAttemptDto,
  ): Promise<StartQuizAttemptResponse> {
    return this.quizzesService.startAttempt(user.id, dto);
  }

  @Get('attempts/:attemptId')
  async getAttempt(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
  ): Promise<QuizAttemptProgressResponse> {
    return this.quizzesService.getAttemptProgress(user.id, attemptId);
  }

  @Get('attempts/:attemptId/questions')
  async listAttemptQuestions(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
    @Query() query: ListQuizAttemptQuestionsDto,
  ): Promise<QuizAttemptQuestionsPageResponse> {
    return this.quizzesService.listAttemptQuestions(user.id, attemptId, query);
  }

  @Post('attempts/:attemptId/answers')
  async submitAnswer(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitQuizAnswerDto,
  ): Promise<SubmitQuizAnswerResponse> {
    return this.quizzesService.submitAnswer(user.id, attemptId, dto);
  }

  @Post('attempts/:attemptId/complete')
  async completeAttempt(
    @CurrentUser() user: AuthUser,
    @Param('attemptId') attemptId: string,
  ): Promise<CompleteQuizAttemptResponse> {
    return this.quizzesService.completeAttempt(user.id, attemptId);
  }

  @Post('attempts')
  async submitAttempt(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitQuizAttemptDto,
  ): Promise<SubmitQuizAttemptResponse> {
    return this.quizzesService.submitAttempt(user.id, dto);
  }

  @Get('stats')
  async getStats(
    @CurrentUser() user: AuthUser,
    @Query() query: QuizStatsQueryDto,
  ): Promise<QuizStatsResponse> {
    return this.quizzesService.getStats(user.id, query.topicId);
  }

  @Patch('stats/reset')
  async resetStats(@CurrentUser() user: AuthUser): Promise<ResetQuizStatsResponse> {
    return this.quizzesService.resetStats(user.id);
  }
}
