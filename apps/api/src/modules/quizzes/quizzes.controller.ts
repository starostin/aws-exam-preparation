import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type {
  QuizQuestionItem,
  QuizStatsResponse,
  QuizTopicSummary,
  SubmitQuizAttemptResponse,
} from '@aws-exam-prep/types';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { ListQuizQuestionsDto } from './dto/list-quiz-questions.dto';
import { QuizStatsQueryDto } from './dto/quiz-stats-query.dto';
import { QuizTopicsQueryDto } from './dto/quiz-topics-query.dto';
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
  async listQuestions(@Query() query: ListQuizQuestionsDto): Promise<QuizQuestionItem[]> {
    return this.quizzesService.listQuestions(query);
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
}
