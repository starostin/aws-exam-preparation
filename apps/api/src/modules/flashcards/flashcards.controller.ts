import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type {
  FlashcardStatsResponse,
  FlashcardTopicSummary,
  FlashcardWithReview,
  SubmitReviewResponse,
} from '@aws-exam-prep/types';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { FlashcardTopicsQueryDto } from './dto/flashcard-topics-query.dto';
import { ListFlashcardsDto } from './dto/list-flashcards.dto';
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

  @Get('stats')
  async getStats(
    @CurrentUser() user: AuthUser,
    @Query() query: FlashcardTopicsQueryDto,
  ): Promise<FlashcardStatsResponse> {
    return this.flashcardsService.getStats(user.id, query.certificationId);
  }
}
