import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  FlashcardConfidence,
  FlashcardStatsResponse,
  FlashcardTopicSummary,
  FlashcardWithReview,
  SubmitReviewResponse,
} from '@aws-exam-prep/types';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';
import type { ListFlashcardsDto } from './dto/list-flashcards.dto';
import type { SubmitReviewDto } from './dto/submit-review.dto';

// Maps confidence level (1–5) to the number of days until the next review.
const CONFIDENCE_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

@Injectable()
export class FlashcardsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async listTopics(userId: string, certificationId?: string): Promise<FlashcardTopicSummary[]> {
    const certificationCondition = certificationId
      ? eq(schema.certifications.id, certificationId)
      : eq(schema.certifications.code, 'SAA-C03');

    const now = new Date();

    const rows = await this.db
      .select({
        topicId: schema.topics.id,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
        cardCount: sql<number>`COUNT(DISTINCT ${schema.flashcards.id})`,
        dueCount: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.reviewSchedules.id} IS NULL OR ${schema.reviewSchedules.nextReviewAt} <= ${now} THEN ${schema.flashcards.id} END)`,
      })
      .from(schema.flashcards)
      .innerJoin(schema.topics, eq(schema.flashcards.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .innerJoin(schema.certifications, eq(schema.domains.certificationId, schema.certifications.id))
      .leftJoin(
        schema.reviewSchedules,
        and(
          eq(schema.reviewSchedules.flashcardId, schema.flashcards.id),
          eq(schema.reviewSchedules.userId, userId),
        ),
      )
      .where(certificationCondition)
      .groupBy(schema.topics.id, schema.topics.title, schema.domains.name)
      .orderBy(schema.domains.name, schema.topics.title);

    return rows.map((row) => ({
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      domainName: row.domainName,
      cardCount: Number(row.cardCount),
      dueCount: Number(row.dueCount),
    }));
  }

  async listFlashcards(userId: string, dto: ListFlashcardsDto): Promise<FlashcardWithReview[]> {
    const now = new Date();

    const conditions: ReturnType<typeof eq>[] = [
      dto.certificationId
        ? eq(schema.certifications.id, dto.certificationId)
        : eq(schema.certifications.code, 'SAA-C03'),
    ];

    if (dto.topicId) {
      conditions.push(eq(schema.flashcards.topicId, dto.topicId));
    }

    if (dto.dueOnly) {
      conditions.push(
        sql`(${schema.reviewSchedules.nextReviewAt} IS NULL OR ${schema.reviewSchedules.nextReviewAt} <= ${now})`,
      );
    }

    const rows = await this.db
      .select({
        id: schema.flashcards.id,
        topicId: schema.flashcards.topicId,
        topicTitle: schema.topics.title,
        front: schema.flashcards.front,
        back: schema.flashcards.back,
        nextReviewAt: schema.reviewSchedules.nextReviewAt,
        confidence: schema.reviewSchedules.confidence,
        createdAt: schema.flashcards.createdAt,
        updatedAt: schema.flashcards.updatedAt,
      })
      .from(schema.flashcards)
      .innerJoin(schema.topics, eq(schema.flashcards.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .innerJoin(schema.certifications, eq(schema.domains.certificationId, schema.certifications.id))
      .leftJoin(
        schema.reviewSchedules,
        and(
          eq(schema.reviewSchedules.flashcardId, schema.flashcards.id),
          eq(schema.reviewSchedules.userId, userId),
        ),
      )
      .where(and(...conditions))
      .orderBy(schema.flashcards.createdAt);

    return rows.map((row) => ({
      id: row.id,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      front: row.front,
      back: row.back,
      nextReviewAt: row.nextReviewAt ? row.nextReviewAt.toISOString() : null,
      confidence: row.confidence as FlashcardConfidence | null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async submitReview(userId: string, dto: SubmitReviewDto): Promise<SubmitReviewResponse> {
    const [flashcard] = await this.db
      .select({ id: schema.flashcards.id })
      .from(schema.flashcards)
      .where(eq(schema.flashcards.id, dto.flashcardId))
      .limit(1);

    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }

    const confidence = dto.confidence as FlashcardConfidence;
    const intervalDays = CONFIDENCE_INTERVAL_DAYS[confidence] ?? 1;
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    const [existing] = await this.db
      .select({ id: schema.reviewSchedules.id })
      .from(schema.reviewSchedules)
      .where(
        and(
          eq(schema.reviewSchedules.userId, userId),
          eq(schema.reviewSchedules.flashcardId, dto.flashcardId),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(schema.reviewSchedules)
        .set({
          confidence,
          nextReviewAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.reviewSchedules.id, existing.id))
        .returning();

      if (!updated) {
        throw new BadRequestException('Failed to update review schedule');
      }

      return {
        reviewId: updated.id,
        flashcardId: dto.flashcardId,
        confidence,
        nextReviewAt: updated.nextReviewAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }

    const [created] = await this.db
      .insert(schema.reviewSchedules)
      .values({
        userId,
        flashcardId: dto.flashcardId,
        confidence,
        nextReviewAt,
      })
      .returning();

    if (!created) {
      throw new BadRequestException('Failed to create review schedule');
    }

    return {
      reviewId: created.id,
      flashcardId: dto.flashcardId,
      confidence,
      nextReviewAt: created.nextReviewAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async getStats(userId: string, certificationId?: string): Promise<FlashcardStatsResponse> {
    const now = new Date();

    const certificationCondition = certificationId
      ? eq(schema.certifications.id, certificationId)
      : eq(schema.certifications.code, 'SAA-C03');

    const [totals] = await this.db
      .select({
        totalCards: sql<number>`COUNT(DISTINCT ${schema.flashcards.id})`,
        reviewedCards: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.reviewSchedules.id} IS NOT NULL THEN ${schema.flashcards.id} END)`,
        dueToday: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.reviewSchedules.id} IS NULL OR ${schema.reviewSchedules.nextReviewAt} <= ${now} THEN ${schema.flashcards.id} END)`,
        averageConfidence: sql<number | null>`AVG(${schema.reviewSchedules.confidence})`,
      })
      .from(schema.flashcards)
      .innerJoin(schema.topics, eq(schema.flashcards.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .innerJoin(schema.certifications, eq(schema.domains.certificationId, schema.certifications.id))
      .leftJoin(
        schema.reviewSchedules,
        and(
          eq(schema.reviewSchedules.flashcardId, schema.flashcards.id),
          eq(schema.reviewSchedules.userId, userId),
        ),
      )
      .where(certificationCondition);

    return {
      totalCards: Number(totals?.totalCards ?? 0),
      reviewedCards: Number(totals?.reviewedCards ?? 0),
      dueToday: Number(totals?.dueToday ?? 0),
      averageConfidence: totals?.averageConfidence != null ? Number(totals.averageConfidence) : null,
    };
  }
}
