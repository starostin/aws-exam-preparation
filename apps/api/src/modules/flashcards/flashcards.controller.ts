import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type {
  CompleteFlashcardSessionResponse,
  FlashcardSessionCardsPageResponse,
  FlashcardSessionProgressResponse,
  FlashcardSessionSummary,
  FlashcardStatsResponse,
  FlashcardTopicSummary,
  FlashcardWithReview,
  ResetFlashcardStatsResponse,
  SubmitReviewResponse,
} from '@aws-exam-prep/types';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { FlashcardTopicsQueryDto } from './dto/flashcard-topics-query.dto';
import { ListFlashcardSessionCardsDto } from './dto/list-flashcard-session-cards.dto';
import { ListFlashcardSessionHistoryDto } from './dto/list-flashcard-session-history.dto';
import { ListFlashcardsDto } from './dto/list-flashcards.dto';
import { StartFlashcardSessionDto } from './dto/start-flashcard-session.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { FlashcardsService } from './flashcards.service';

@Controller({ path: 'flashcards', version: '1' })
@UseGuards(AuthGuard)
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get('topics')
  async listTopics(
    @CurrentUser() user: AuthUser,
    @Query() query: FlashcardTopicsQueryDto,
  ): Promise<FlashcardTopicSummary[]> {
    return this.flashcardsService.listTopics(user.id, query.certificationId);
  }

  @Get('due')
  async listDue(
    @CurrentUser() user: AuthUser,
    @Query() query: ListFlashcardsDto,
  ): Promise<FlashcardWithReview[]> {
    return this.flashcardsService.listFlashcards(user.id, { ...query, dueOnly: true });
  }

  @Get()
  async listFlashcards(
    @CurrentUser() user: AuthUser,
    @Query() query: ListFlashcardsDto,
  ): Promise<FlashcardWithReview[]> {
    return this.flashcardsService.listFlashcards(user.id, query);
  }

  @Post('review')
  async submitReview(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitReviewDto,
  ): Promise<SubmitReviewResponse> {
    return this.flashcardsService.submitReview(user.id, dto);
  }

  @Get('sessions/history')
  async listSessionHistory(
    @CurrentUser() user: AuthUser,
    @Query() query: ListFlashcardSessionHistoryDto,
  ): Promise<FlashcardSessionSummary[]> {
    return this.flashcardsService.listSessionHistory(user.id, query.certificationId);
  }

  @Post('sessions/start')
  async startSession(
    @CurrentUser() user: AuthUser,
    @Body() dto: StartFlashcardSessionDto,
  ): Promise<FlashcardSessionProgressResponse> {
    return this.flashcardsService.startSession(user.id, dto);
  }

  @Get('sessions/:sessionId')
  async getSession(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ): Promise<FlashcardSessionProgressResponse> {
    return this.flashcardsService.getSessionProgress(user.id, sessionId);
  }

  @Get('sessions/:sessionId/cards')
  async listSessionCards(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Query() query: ListFlashcardSessionCardsDto,
  ): Promise<FlashcardSessionCardsPageResponse> {
    return this.flashcardsService.listSessionCards(user.id, sessionId, query);
  }

  @Post('sessions/:sessionId/review')
  async submitSessionReview(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<SubmitReviewResponse> {
    return this.flashcardsService.submitSessionReview(user.id, sessionId, dto);
  }

  @Post('sessions/:sessionId/complete')
  async completeSession(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ): Promise<CompleteFlashcardSessionResponse> {
    return this.flashcardsService.completeSession(user.id, sessionId);
  }

  @Get('stats')
  async getStats(
    @CurrentUser() user: AuthUser,
    @Query() query: FlashcardTopicsQueryDto,
  ): Promise<FlashcardStatsResponse> {
    return this.flashcardsService.getStats(user.id, query.certificationId);
  }

  @Patch('stats/reset')
  async resetStats(@CurrentUser() user: AuthUser): Promise<ResetFlashcardStatsResponse> {
    return this.flashcardsService.resetStats(user.id);
  }
}
