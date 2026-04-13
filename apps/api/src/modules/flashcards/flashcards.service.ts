import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  CompleteFlashcardSessionResponse,
  FlashcardConfidence,
  FlashcardSessionCardsPageResponse,
  FlashcardSessionFilter,
  FlashcardSessionProgressResponse,
  FlashcardSessionSummary,
  FlashcardSessionStatus,
  FlashcardStatsResponse,
  FlashcardTopicSummary,
  FlashcardWithReview,
  ResetFlashcardStatsResponse,
  SubmitReviewResponse,
} from '@aws-exam-prep/types';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';
import type { ListFlashcardSessionCardsDto } from './dto/list-flashcard-session-cards.dto';
import type { ListFlashcardsDto } from './dto/list-flashcards.dto';
import type { StartFlashcardSessionDto } from './dto/start-flashcard-session.dto';
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

  private async getActivePlanMaterialTopicIds(
    userId: string,
    certificationId?: string,
  ): Promise<Set<string> | null> {
    const planRows = await this.db
      .select({
        id: schema.studyPlans.id,
        certificationId: schema.studyPlans.certificationId,
      })
      .from(schema.studyPlans)
      .where(eq(schema.studyPlans.userId, userId))
      .orderBy(desc(schema.studyPlans.createdAt));

    const activePlan = certificationId
      ? planRows.find((row) => row.certificationId === certificationId)
      : planRows[0];

    if (!activePlan) return null;

    const materialTopicRows = await this.db
      .selectDistinct({ topicId: schema.studyTasks.topicId })
      .from(schema.studyTasks)
      .where(
        and(
          eq(schema.studyTasks.studyPlanId, activePlan.id),
          inArray(schema.studyTasks.type, ['course', 'video']),
          sql`${schema.studyTasks.topicId} IS NOT NULL`,
          sql`${schema.studyTasks.externalResourceId} IS NOT NULL`,
        ),
      );

    const materialTopicIds = new Set(
      materialTopicRows
        .map((row) => row.topicId)
        .filter((id): id is string => id !== null),
    );

    // If an active plan exists but has no mapped material topics yet,
    // fall back to showing all flashcard topics instead of an empty list.
    if (materialTopicIds.size === 0) return null;

    return materialTopicIds;
  }

  async listTopics(userId: string, certificationId?: string): Promise<FlashcardTopicSummary[]> {
    const certificationCondition = certificationId
      ? eq(schema.certifications.id, certificationId)
      : eq(schema.certifications.code, 'SAA-C03');

    const materialTopicIds = await this.getActivePlanMaterialTopicIds(userId, certificationId);
    if (materialTopicIds !== null && materialTopicIds.size === 0) {
      return [];
    }

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
      .where(
        and(
          certificationCondition,
          materialTopicIds === null
            ? sql`TRUE`
            : inArray(schema.topics.id, Array.from(materialTopicIds)),
        ),
      )
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

    const conditions: SQL<unknown>[] = [
      dto.certificationId
        ? eq(schema.certifications.id, dto.certificationId)
        : eq(schema.certifications.code, 'SAA-C03'),
    ];

    const materialTopicIds = await this.getActivePlanMaterialTopicIds(userId, dto.certificationId);
    if (materialTopicIds !== null && materialTopicIds.size === 0) {
      return [];
    }

    if (materialTopicIds !== null) {
      conditions.push(inArray(schema.flashcards.topicId, Array.from(materialTopicIds)));
    }

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

  async listSessionHistory(userId: string, certificationId?: string): Promise<FlashcardSessionSummary[]> {
    const conditions: SQL<unknown>[] = [eq(schema.flashcardReviewSessions.userId, userId)];
    if (certificationId) {
      conditions.push(eq(schema.flashcardReviewSessions.certificationId, certificationId));
    }

    const rows = await this.db
      .select({
        sessionId: schema.flashcardReviewSessions.id,
        certificationId: schema.flashcardReviewSessions.certificationId,
        topicId: schema.flashcardReviewSessions.topicId,
        topicTitle: schema.topics.title,
        filter: schema.flashcardReviewSessions.filter,
        status: schema.flashcardReviewSessions.status,
        totalCards: schema.flashcardReviewSessions.totalCards,
        reviewedCards: schema.flashcardReviewSessions.reviewedCards,
        startedAt: schema.flashcardReviewSessions.startedAt,
        completedAt: schema.flashcardReviewSessions.completedAt,
      })
      .from(schema.flashcardReviewSessions)
      .leftJoin(schema.topics, eq(schema.flashcardReviewSessions.topicId, schema.topics.id))
      .where(and(...conditions))
      .orderBy(desc(schema.flashcardReviewSessions.startedAt));

    return rows.map((row) => this.toSessionSummary(row));
  }

  async startSession(userId: string, dto: StartFlashcardSessionDto): Promise<FlashcardSessionProgressResponse> {
    const filter = (dto.filter ?? 'all') as FlashcardSessionFilter;
    const dueOnly = filter === 'due_only';
    const listInput: ListFlashcardsDto = {
      dueOnly,
      ...(dto.topicId ? { topicId: dto.topicId } : {}),
      ...(dto.certificationId ? { certificationId: dto.certificationId } : {}),
    };
    const cards = await this.listFlashcards(userId, {
      ...listInput,
    });

    const selectedCards = dto.limit ? cards.slice(0, dto.limit) : cards;
    if (selectedCards.length === 0) {
      throw new BadRequestException(
        dueOnly
          ? 'No flashcards are due for the selected filters'
          : 'No flashcards found for the selected filters',
      );
    }

    const certificationId = await this.getCertificationId(dto.certificationId);
    const now = new Date();

    const [created] = await this.db.transaction(async (tx) => {
      const [session] = await tx
        .insert(schema.flashcardReviewSessions)
        .values({
          userId,
          certificationId,
          topicId: dto.topicId ?? null,
          filter,
          status: 'in_progress',
          totalCards: selectedCards.length,
          reviewedCards: 0,
          startedAt: now,
          updatedAt: now,
        })
        .returning({
          sessionId: schema.flashcardReviewSessions.id,
          certificationId: schema.flashcardReviewSessions.certificationId,
          topicId: schema.flashcardReviewSessions.topicId,
          filter: schema.flashcardReviewSessions.filter,
          status: schema.flashcardReviewSessions.status,
          totalCards: schema.flashcardReviewSessions.totalCards,
          reviewedCards: schema.flashcardReviewSessions.reviewedCards,
          startedAt: schema.flashcardReviewSessions.startedAt,
          completedAt: schema.flashcardReviewSessions.completedAt,
        });

      if (!session) {
        throw new BadRequestException('Failed to start flashcard session');
      }

      await tx.insert(schema.flashcardReviewSessionCards).values(
        selectedCards.map((card, index) => ({
          sessionId: session.sessionId,
          flashcardId: card.id,
          cardOrder: index + 1,
        })),
      );

      return [session] as const;
    });

    const topicTitle = created.topicId ? (selectedCards[0]?.topicTitle ?? null) : null;
    return this.toSessionSummary({ ...created, topicTitle });
  }

  async getSessionProgress(userId: string, sessionId: string): Promise<FlashcardSessionProgressResponse> {
    return this.toSessionSummary(await this.getOwnedSession(userId, sessionId));
  }

  async listSessionCards(
    userId: string,
    sessionId: string,
    dto: ListFlashcardSessionCardsDto,
  ): Promise<FlashcardSessionCardsPageResponse> {
    await this.getOwnedSession(userId, sessionId);

    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const [total] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.flashcardReviewSessionCards)
      .where(eq(schema.flashcardReviewSessionCards.sessionId, sessionId));

    const rows = await this.db
      .select({
        sessionCardId: schema.flashcardReviewSessionCards.id,
        cardOrder: schema.flashcardReviewSessionCards.cardOrder,
        confidence: schema.flashcardReviewSessionCards.confidence,
        reviewedAt: schema.flashcardReviewSessionCards.reviewedAt,
        id: schema.flashcards.id,
        topicId: schema.flashcards.topicId,
        topicTitle: schema.topics.title,
        front: schema.flashcards.front,
        back: schema.flashcards.back,
        nextReviewAt: schema.reviewSchedules.nextReviewAt,
        scheduleConfidence: schema.reviewSchedules.confidence,
        createdAt: schema.flashcards.createdAt,
        updatedAt: schema.flashcards.updatedAt,
      })
      .from(schema.flashcardReviewSessionCards)
      .innerJoin(schema.flashcards, eq(schema.flashcardReviewSessionCards.flashcardId, schema.flashcards.id))
      .innerJoin(schema.topics, eq(schema.flashcards.topicId, schema.topics.id))
      .leftJoin(
        schema.reviewSchedules,
        and(
          eq(schema.reviewSchedules.flashcardId, schema.flashcards.id),
          eq(schema.reviewSchedules.userId, userId),
        ),
      )
      .where(eq(schema.flashcardReviewSessionCards.sessionId, sessionId))
      .orderBy(schema.flashcardReviewSessionCards.cardOrder)
      .limit(pageSize)
      .offset(offset);

    return {
      sessionId,
      page,
      pageSize,
      totalCards: Number(total?.count ?? 0),
      items: rows.map((row) => ({
        sessionCardId: row.sessionCardId,
        cardOrder: row.cardOrder,
        confidence: row.confidence as FlashcardConfidence | null,
        reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
        card: {
          id: row.id,
          topicId: row.topicId,
          topicTitle: row.topicTitle,
          front: row.front,
          back: row.back,
          nextReviewAt: row.nextReviewAt ? row.nextReviewAt.toISOString() : null,
          confidence: row.scheduleConfidence as FlashcardConfidence | null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        },
      })),
    };
  }

  async submitReview(userId: string, dto: SubmitReviewDto): Promise<SubmitReviewResponse> {
    return this.saveReviewSchedule(userId, dto);
  }

  async submitSessionReview(
    userId: string,
    sessionId: string,
    dto: SubmitReviewDto,
  ): Promise<SubmitReviewResponse> {
    const session = await this.getOwnedSession(userId, sessionId);
    if (session.status !== 'in_progress') {
      throw new BadRequestException('Cannot submit reviews for a completed flashcard session');
    }

    const [sessionCard] = await this.db
      .select({
        id: schema.flashcardReviewSessionCards.id,
        reviewedAt: schema.flashcardReviewSessionCards.reviewedAt,
      })
      .from(schema.flashcardReviewSessionCards)
      .where(
        and(
          eq(schema.flashcardReviewSessionCards.sessionId, sessionId),
          eq(schema.flashcardReviewSessionCards.flashcardId, dto.flashcardId),
        ),
      )
      .limit(1);

    if (!sessionCard) {
      throw new NotFoundException('Flashcard was not found in this session');
    }

    if (sessionCard.reviewedAt) {
      throw new BadRequestException('Flashcard was already reviewed in this session');
    }

    const review = await this.saveReviewSchedule(userId, dto);
    const reviewedAt = new Date();

    await this.db
      .update(schema.flashcardReviewSessionCards)
      .set({
        confidence: dto.confidence,
        reviewedAt,
        updatedAt: reviewedAt,
      })
      .where(eq(schema.flashcardReviewSessionCards.id, sessionCard.id));

    const [counts] = await this.db
      .select({
        reviewedCards: sql<number>`COUNT(${schema.flashcardReviewSessionCards.reviewedAt})`,
      })
      .from(schema.flashcardReviewSessionCards)
      .where(eq(schema.flashcardReviewSessionCards.sessionId, sessionId));

    await this.db
      .update(schema.flashcardReviewSessions)
      .set({
        reviewedCards: Number(counts?.reviewedCards ?? 0),
        updatedAt: new Date(),
      })
      .where(eq(schema.flashcardReviewSessions.id, sessionId));

    return review;
  }

  async completeSession(userId: string, sessionId: string): Promise<CompleteFlashcardSessionResponse> {
    const session = await this.getOwnedSession(userId, sessionId);

    const [stats] = await this.db
      .select({
        totalCards: sql<number>`COUNT(*)`,
        reviewedCards: sql<number>`COUNT(${schema.flashcardReviewSessionCards.reviewedAt})`,
        averageConfidence: sql<number | null>`AVG(${schema.flashcardReviewSessionCards.confidence})`,
      })
      .from(schema.flashcardReviewSessionCards)
      .where(eq(schema.flashcardReviewSessionCards.sessionId, sessionId));

    const totalCards = Number(stats?.totalCards ?? 0);
    const reviewedCards = Number(stats?.reviewedCards ?? 0);
    const averageConfidence = stats?.averageConfidence != null ? Number(stats.averageConfidence) : null;

    if (session.status === 'completed' && session.completedAt) {
      return {
        sessionId,
        status: 'completed',
        totalCards,
        reviewedCards,
        averageConfidence,
        completedAt: session.completedAt.toISOString(),
      };
    }

    if (reviewedCards !== totalCards) {
      throw new BadRequestException('All flashcards in the session must be reviewed before completing');
    }

    const completedAt = new Date();
    await this.db
      .update(schema.flashcardReviewSessions)
      .set({
        status: 'completed',
        reviewedCards,
        completedAt,
        updatedAt: completedAt,
      })
      .where(eq(schema.flashcardReviewSessions.id, sessionId));

    return {
      sessionId,
      status: 'completed',
      totalCards,
      reviewedCards,
      averageConfidence,
      completedAt: completedAt.toISOString(),
    };
  }

  private async saveReviewSchedule(userId: string, dto: SubmitReviewDto): Promise<SubmitReviewResponse> {
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

    const inProgressConditions: SQL<unknown>[] = [
      eq(schema.flashcardReviewSessions.userId, userId),
      eq(schema.flashcardReviewSessions.status, 'in_progress'),
    ];
    if (certificationId) {
      inProgressConditions.push(eq(schema.flashcardReviewSessions.certificationId, certificationId));
    }

    const [sessionTotals] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.flashcardReviewSessions)
      .where(and(...inProgressConditions));

    return {
      totalCards: Number(totals?.totalCards ?? 0),
      reviewedCards: Number(totals?.reviewedCards ?? 0),
      dueToday: Number(totals?.dueToday ?? 0),
      averageConfidence: totals?.averageConfidence != null ? Number(totals.averageConfidence) : null,
      inProgressSessions: Number(sessionTotals?.count ?? 0),
    };
  }

  async resetStats(userId: string): Promise<ResetFlashcardStatsResponse> {
    await this.db.transaction(async (tx) => {
      const sessionRows = await tx
        .select({ id: schema.flashcardReviewSessions.id })
        .from(schema.flashcardReviewSessions)
        .where(eq(schema.flashcardReviewSessions.userId, userId));

      const sessionIds = sessionRows.map((row) => row.id);
      if (sessionIds.length > 0) {
        await tx
          .delete(schema.flashcardReviewSessionCards)
          .where(inArray(schema.flashcardReviewSessionCards.sessionId, sessionIds));
      }

      await tx
        .delete(schema.flashcardReviewSessions)
        .where(eq(schema.flashcardReviewSessions.userId, userId));
      await tx
        .delete(schema.reviewSchedules)
        .where(eq(schema.reviewSchedules.userId, userId));
    });

    return { message: 'Flashcard stats reset successfully.' };
  }

  private async getOwnedSession(userId: string, sessionId: string): Promise<{
    sessionId: string;
    certificationId: string;
    topicId: string | null;
    topicTitle: string | null;
    filter: string;
    status: string;
    totalCards: number;
    reviewedCards: number;
    startedAt: Date;
    completedAt: Date | null;
  }> {
    const [session] = await this.db
      .select({
        sessionId: schema.flashcardReviewSessions.id,
        certificationId: schema.flashcardReviewSessions.certificationId,
        topicId: schema.flashcardReviewSessions.topicId,
        topicTitle: schema.topics.title,
        filter: schema.flashcardReviewSessions.filter,
        status: schema.flashcardReviewSessions.status,
        totalCards: schema.flashcardReviewSessions.totalCards,
        reviewedCards: schema.flashcardReviewSessions.reviewedCards,
        startedAt: schema.flashcardReviewSessions.startedAt,
        completedAt: schema.flashcardReviewSessions.completedAt,
      })
      .from(schema.flashcardReviewSessions)
      .leftJoin(schema.topics, eq(schema.flashcardReviewSessions.topicId, schema.topics.id))
      .where(
        and(
          eq(schema.flashcardReviewSessions.id, sessionId),
          eq(schema.flashcardReviewSessions.userId, userId),
        ),
      )
      .limit(1);

    if (!session) {
      throw new NotFoundException('Flashcard session not found');
    }

    return session;
  }

  private toSessionSummary(row: {
    sessionId: string;
    certificationId: string;
    topicId: string | null;
    topicTitle: string | null;
    filter: string;
    status: string;
    totalCards: number;
    reviewedCards: number;
    startedAt: Date;
    completedAt: Date | null;
  }): FlashcardSessionSummary {
    return {
      sessionId: row.sessionId,
      certificationId: row.certificationId,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      filter: row.filter as FlashcardSessionFilter,
      status: row.status as FlashcardSessionStatus,
      totalCards: Number(row.totalCards),
      reviewedCards: Number(row.reviewedCards),
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    };
  }

  private async getCertificationId(certificationId?: string): Promise<string> {
    if (certificationId) return certificationId;

    const [certification] = await this.db
      .select({ id: schema.certifications.id })
      .from(schema.certifications)
      .where(eq(schema.certifications.code, 'SAA-C03'))
      .limit(1);

    if (!certification) {
      throw new BadRequestException('Default certification was not found');
    }

    return certification.id;
  }
}
