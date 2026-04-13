import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  CompleteMockExamAttemptResponse,
  MockExamAttemptHistoryItem,
  MockExamAttemptProgressResponse,
  MockExamQuestionsPageResponse,
  MockExamStatsResponse,
  MockExamSummary,
  PublicQuizOption,
  QuestionDifficulty,
  ResetMockExamStatsResponse,
  StartMockExamAttemptResponse,
  SubmitMockExamAnswerResponse,
} from '@aws-exam-prep/types';
import * as schema from '../../database/schema';
import { DRIZZLE } from '../database/database.module';
import type { ListAttemptQuestionsDto } from './dto/list-attempt-questions.dto';
import type { SubmitMockExamAnswerDto } from './dto/submit-mock-exam-answer.dto';

interface RawExamOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AttemptReviewItem {
  questionId: string;
  questionOrder: number;
  topicTitle: string;
  domainName: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  explanation: string;
  isCorrect: boolean;
}

@Injectable()
export class MockExamsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async listMockExams(certificationId?: string): Promise<MockExamSummary[]> {
    const certificationCondition = certificationId
      ? eq(schema.certifications.id, certificationId)
      : eq(schema.certifications.code, 'SAA-C03');

    const rows = await this.db
      .select({
        id: schema.mockExams.id,
        certificationId: schema.mockExams.certificationId,
        certificationCode: schema.certifications.code,
        title: schema.mockExams.title,
        durationMinutes: schema.mockExams.durationMinutes,
        totalQuestions: schema.mockExams.totalQuestions,
      })
      .from(schema.mockExams)
      .innerJoin(schema.certifications, eq(schema.mockExams.certificationId, schema.certifications.id))
      .where(certificationCondition)
      .orderBy(schema.mockExams.title);

    return rows;
  }

  async listAttemptHistory(userId: string, certificationId?: string): Promise<MockExamAttemptHistoryItem[]> {
    const conditions = [eq(schema.mockExamAttempts.userId, userId)];
    if (certificationId) {
      conditions.push(eq(schema.mockExams.certificationId, certificationId));
    }

    const rows = await this.db
      .select({
        attemptId: schema.mockExamAttempts.id,
        mockExamId: schema.mockExamAttempts.mockExamId,
        mockExamTitle: schema.mockExams.title,
        certificationId: schema.mockExams.certificationId,
        status: schema.mockExamAttempts.status,
        score: schema.mockExamAttempts.score,
        startedAt: schema.mockExamAttempts.startedAt,
        completedAt: schema.mockExamAttempts.completedAt,
      })
      .from(schema.mockExamAttempts)
      .innerJoin(schema.mockExams, eq(schema.mockExamAttempts.mockExamId, schema.mockExams.id))
      .where(and(...conditions))
      .orderBy(desc(schema.mockExamAttempts.startedAt));

    return rows.map((row) => ({
      attemptId: row.attemptId,
      mockExamId: row.mockExamId,
      mockExamTitle: row.mockExamTitle,
      certificationId: row.certificationId,
      status: row.status,
      score: row.score != null ? Number(row.score) : null,
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    }));
  }

  async startAttempt(userId: string, mockExamId: string): Promise<StartMockExamAttemptResponse> {
    const [exam] = await this.db
      .select({
        id: schema.mockExams.id,
        title: schema.mockExams.title,
        durationMinutes: schema.mockExams.durationMinutes,
        totalQuestions: schema.mockExams.totalQuestions,
      })
      .from(schema.mockExams)
      .where(eq(schema.mockExams.id, mockExamId))
      .limit(1);

    if (!exam) {
      throw new NotFoundException('Mock exam not found');
    }

    const questionRows = await this.db
      .select({ id: schema.mockExamQuestions.id })
      .from(schema.mockExamQuestions)
      .where(eq(schema.mockExamQuestions.mockExamId, mockExamId))
      .orderBy(sql`random()`)
      .limit(exam.totalQuestions);

    if (questionRows.length < exam.totalQuestions) {
      throw new BadRequestException('Mock exam question bank is incomplete');
    }

    const now = new Date();

    const attempt = await this.db.transaction(async (tx) => {
      const [createdAttempt] = await tx
        .insert(schema.mockExamAttempts)
        .values({
          userId,
          mockExamId,
          status: 'in_progress',
          startedAt: now,
        })
        .returning({
          id: schema.mockExamAttempts.id,
          startedAt: schema.mockExamAttempts.startedAt,
        });

      if (!createdAttempt) {
        throw new BadRequestException('Failed to start mock exam attempt');
      }

      await tx.insert(schema.mockExamAttemptQuestions).values(
        questionRows.map((question, index) => ({
          attemptId: createdAttempt.id,
          questionId: question.id,
          questionOrder: index + 1,
        })),
      );

      return createdAttempt;
    });

    return {
      attemptId: attempt.id,
      mockExamId,
      title: exam.title,
      status: 'in_progress',
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      answeredQuestions: 0,
      startedAt: attempt.startedAt.toISOString(),
    };
  }

  async getAttemptProgress(userId: string, attemptId: string): Promise<MockExamAttemptProgressResponse> {
    const attempt = await this.getOwnedAttempt(userId, attemptId);

    const questionRows = await this.db
      .select({
        selectedOptionId: schema.mockExamAttemptQuestions.selectedOptionId,
      })
      .from(schema.mockExamAttemptQuestions)
      .where(eq(schema.mockExamAttemptQuestions.attemptId, attemptId));

    const answeredQuestions = questionRows.filter((row) => row.selectedOptionId != null).length;

    return {
      attemptId: attempt.id,
      mockExamId: attempt.mockExamId,
      title: attempt.title,
      status: attempt.status,
      durationMinutes: attempt.durationMinutes,
      totalQuestions: attempt.totalQuestions,
      answeredQuestions,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt ? attempt.completedAt.toISOString() : null,
      score: attempt.score != null ? Number(attempt.score) : null,
    };
  }

  async listAttemptQuestions(
    userId: string,
    attemptId: string,
    dto: ListAttemptQuestionsDto,
  ): Promise<MockExamQuestionsPageResponse> {
    await this.getOwnedAttempt(userId, attemptId);

    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 1;
    const offset = (page - 1) * pageSize;

    const totalRows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.mockExamAttemptQuestions)
      .where(eq(schema.mockExamAttemptQuestions.attemptId, attemptId));

    const rows = await this.db
      .select({
        attemptQuestionId: schema.mockExamAttemptQuestions.id,
        questionOrder: schema.mockExamAttemptQuestions.questionOrder,
        selectedOptionId: schema.mockExamAttemptQuestions.selectedOptionId,
        answeredAt: schema.mockExamAttemptQuestions.answeredAt,
        questionId: schema.mockExamQuestions.id,
        topicId: schema.mockExamQuestions.topicId,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
        text: schema.mockExamQuestions.text,
        options: schema.mockExamQuestions.options,
        difficulty: schema.mockExamQuestions.difficulty,
      })
      .from(schema.mockExamAttemptQuestions)
      .innerJoin(schema.mockExamQuestions, eq(schema.mockExamAttemptQuestions.questionId, schema.mockExamQuestions.id))
      .innerJoin(schema.topics, eq(schema.mockExamQuestions.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(eq(schema.mockExamAttemptQuestions.attemptId, attemptId))
      .orderBy(schema.mockExamAttemptQuestions.questionOrder)
      .limit(pageSize)
      .offset(offset);

    return {
      attemptId,
      page,
      pageSize,
      totalQuestions: Number(totalRows[0]?.count ?? 0),
      items: rows.map((row) => ({
        attemptQuestionId: row.attemptQuestionId,
        questionOrder: row.questionOrder,
        selectedOptionId: row.selectedOptionId,
        answeredAt: row.answeredAt ? row.answeredAt.toISOString() : null,
        question: {
          id: row.questionId,
          topicId: row.topicId,
          topicTitle: row.topicTitle,
          domainName: row.domainName,
          text: row.text,
          options: this.toPublicOptions(row.options),
          difficulty: row.difficulty as QuestionDifficulty,
        },
      })),
    };
  }

  async submitAnswer(
    userId: string,
    attemptId: string,
    dto: SubmitMockExamAnswerDto,
  ): Promise<SubmitMockExamAnswerResponse> {
    const attempt = await this.getOwnedAttempt(userId, attemptId);
    if (attempt.status === 'completed') {
      throw new BadRequestException('Cannot submit answers for completed attempts');
    }

    const [row] = await this.db
      .select({
        attemptQuestionId: schema.mockExamAttemptQuestions.id,
        options: schema.mockExamQuestions.options,
        explanation: schema.mockExamQuestions.explanation,
      })
      .from(schema.mockExamAttemptQuestions)
      .innerJoin(schema.mockExamQuestions, eq(schema.mockExamAttemptQuestions.questionId, schema.mockExamQuestions.id))
      .where(
        and(
          eq(schema.mockExamAttemptQuestions.attemptId, attemptId),
          eq(schema.mockExamAttemptQuestions.questionId, dto.questionId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException('Question not found in this attempt');
    }

    const options = this.parseOptions(row.options);
    const selectedOption = options.find((option) => option.id === dto.selectedOptionId);
    if (!selectedOption) {
      throw new BadRequestException('Selected option does not belong to this question');
    }

    const correctOption = options.find((option) => option.isCorrect);
    if (!correctOption) {
      throw new BadRequestException('Question has no correct option configured');
    }

    const isCorrect = selectedOption.id === correctOption.id;

    const [updated] = await this.db
      .update(schema.mockExamAttemptQuestions)
      .set({
        selectedOptionId: selectedOption.id,
        isCorrect,
        answeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.mockExamAttemptQuestions.id, row.attemptQuestionId))
      .returning({
        answeredAt: schema.mockExamAttemptQuestions.answeredAt,
      });

    if (!updated?.answeredAt) {
      throw new BadRequestException('Failed to save answer');
    }

    return {
      attemptId,
      questionId: dto.questionId,
      selectedOptionId: selectedOption.id,
      isCorrect,
      correctOptionId: correctOption.id,
      explanation: row.explanation,
      answeredAt: updated.answeredAt.toISOString(),
    };
  }

  async completeAttempt(userId: string, attemptId: string): Promise<CompleteMockExamAttemptResponse> {
    const attempt = await this.getOwnedAttempt(userId, attemptId);
    if (attempt.status === 'completed' && attempt.completedAt) {
      const normalizedScore = Number(attempt.score ?? 0);
      const correctAnswers = Math.round((normalizedScore / 100) * attempt.totalQuestions);
      const reviewItems = await this.buildAttemptReview(attemptId);
      return {
        attemptId: attempt.id,
        status: 'completed',
        score: normalizedScore,
        correctAnswers,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt.toISOString(),
        reviewItems,
      };
    }

    const reviewItems = await this.buildAttemptReview(attemptId);

    if (reviewItems.length === 0) {
      throw new BadRequestException('No questions found for this attempt');
    }

    if (reviewItems.some((item: AttemptReviewItem) => item.selectedOptionId == null)) {
      throw new BadRequestException('All questions must be answered before completing the mock exam');
    }

    const totalQuestions = reviewItems.length;
    const correctAnswers = reviewItems.filter((item: AttemptReviewItem) => item.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 10000) / 100;

    const [updatedAttempt] = await this.db
      .update(schema.mockExamAttempts)
      .set({
        status: 'completed',
        score,
        completedAt: new Date(),
      })
      .where(eq(schema.mockExamAttempts.id, attemptId))
      .returning({
        id: schema.mockExamAttempts.id,
        status: schema.mockExamAttempts.status,
        completedAt: schema.mockExamAttempts.completedAt,
      });

    if (!updatedAttempt?.completedAt) {
      throw new BadRequestException('Failed to complete mock exam attempt');
    }

    return {
      attemptId: updatedAttempt.id,
      status: updatedAttempt.status,
      score,
      correctAnswers,
      totalQuestions,
      completedAt: updatedAttempt.completedAt.toISOString(),
      reviewItems,
    };
  }

  async getStats(userId: string): Promise<MockExamStatsResponse> {
    const [overall] = await this.db
      .select({
        totalAttempts: sql<number>`COUNT(*)`,
        completedAttempts: sql<number>`SUM(CASE WHEN ${schema.mockExamAttempts.status} = 'completed' THEN 1 ELSE 0 END)`,
        inProgressAttempts: sql<number>`SUM(CASE WHEN ${schema.mockExamAttempts.status} = 'in_progress' THEN 1 ELSE 0 END)`,
        averageScore: sql<number>`AVG(${schema.mockExamAttempts.score})`,
        bestScore: sql<number>`MAX(${schema.mockExamAttempts.score})`,
      })
      .from(schema.mockExamAttempts)
      .where(eq(schema.mockExamAttempts.userId, userId));

    return {
      totalAttempts: Number(overall?.totalAttempts ?? 0),
      completedAttempts: Number(overall?.completedAttempts ?? 0),
      inProgressAttempts: Number(overall?.inProgressAttempts ?? 0),
      averageScore: overall?.averageScore != null ? Number(overall.averageScore) : null,
      bestScore: overall?.bestScore != null ? Number(overall.bestScore) : null,
    };
  }

  async resetStats(userId: string): Promise<ResetMockExamStatsResponse> {
    await this.db.transaction(async (tx) => {
      const attemptRows = await tx
        .select({ id: schema.mockExamAttempts.id })
        .from(schema.mockExamAttempts)
        .where(eq(schema.mockExamAttempts.userId, userId));

      const attemptIds = attemptRows.map((row) => row.id);
      if (attemptIds.length > 0) {
        await tx
          .delete(schema.mockExamAttemptQuestions)
          .where(inArray(schema.mockExamAttemptQuestions.attemptId, attemptIds));
      }

      await tx.delete(schema.mockExamAttempts).where(eq(schema.mockExamAttempts.userId, userId));
    });

    return { message: 'Mock exam stats reset successfully.' };
  }

  private async getOwnedAttempt(userId: string, attemptId: string): Promise<{
    id: string;
    mockExamId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    score: number | null;
    startedAt: Date;
    completedAt: Date | null;
    title: string;
    durationMinutes: number;
    totalQuestions: number;
  }> {
    const [attempt] = await this.db
      .select({
        id: schema.mockExamAttempts.id,
        mockExamId: schema.mockExamAttempts.mockExamId,
        status: schema.mockExamAttempts.status,
        score: schema.mockExamAttempts.score,
        startedAt: schema.mockExamAttempts.startedAt,
        completedAt: schema.mockExamAttempts.completedAt,
        title: schema.mockExams.title,
        durationMinutes: schema.mockExams.durationMinutes,
        totalQuestions: schema.mockExams.totalQuestions,
      })
      .from(schema.mockExamAttempts)
      .innerJoin(schema.mockExams, eq(schema.mockExamAttempts.mockExamId, schema.mockExams.id))
      .where(
        and(
          eq(schema.mockExamAttempts.id, attemptId),
          eq(schema.mockExamAttempts.userId, userId),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Mock exam attempt not found');
    }

    return {
      id: attempt.id,
      mockExamId: attempt.mockExamId,
      status: attempt.status,
      score: attempt.score != null ? Number(attempt.score) : null,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      title: attempt.title,
      durationMinutes: attempt.durationMinutes,
      totalQuestions: attempt.totalQuestions,
    };
  }

  private toPublicOptions(rawOptions: unknown): PublicQuizOption[] {
    return this.parseOptions(rawOptions).map((option) => ({
      id: option.id,
      text: option.text,
    }));
  }

  private async buildAttemptReview(attemptId: string): Promise<AttemptReviewItem[]> {
    const rows = await this.db
      .select({
        questionId: schema.mockExamQuestions.id,
        questionOrder: schema.mockExamAttemptQuestions.questionOrder,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
        questionText: schema.mockExamQuestions.text,
        selectedOptionId: schema.mockExamAttemptQuestions.selectedOptionId,
        isCorrect: schema.mockExamAttemptQuestions.isCorrect,
        options: schema.mockExamQuestions.options,
        explanation: schema.mockExamQuestions.explanation,
      })
      .from(schema.mockExamAttemptQuestions)
      .innerJoin(schema.mockExamQuestions, eq(schema.mockExamAttemptQuestions.questionId, schema.mockExamQuestions.id))
      .innerJoin(schema.topics, eq(schema.mockExamQuestions.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(eq(schema.mockExamAttemptQuestions.attemptId, attemptId))
      .orderBy(schema.mockExamAttemptQuestions.questionOrder);

    return rows.map((row) => {
      const options = this.parseOptions(row.options);
      const correctOption = options.find((option) => option.isCorrect);
      if (!correctOption) {
        throw new BadRequestException('Question has no correct option configured');
      }

      const selectedOption = row.selectedOptionId
        ? options.find((option) => option.id === row.selectedOptionId) ?? null
        : null;

      return {
        questionId: row.questionId,
        questionOrder: row.questionOrder,
        topicTitle: row.topicTitle,
        domainName: row.domainName,
        questionText: row.questionText,
        selectedOptionId: row.selectedOptionId,
        selectedOptionText: selectedOption?.text ?? null,
        correctOptionId: correctOption.id,
        correctOptionText: correctOption.text,
        explanation: row.explanation,
        isCorrect: row.isCorrect === true,
      };
    });
  }

  private parseOptions(rawOptions: unknown): RawExamOption[] {
    if (!Array.isArray(rawOptions)) {
      throw new BadRequestException('Question options payload is invalid');
    }

    const options: RawExamOption[] = [];
    for (const option of rawOptions) {
      if (
        typeof option === 'object'
        && option !== null
        && typeof (option as { id?: unknown }).id === 'string'
        && typeof (option as { text?: unknown }).text === 'string'
        && typeof (option as { isCorrect?: unknown }).isCorrect === 'boolean'
      ) {
        options.push({
          id: (option as { id: string }).id,
          text: (option as { text: string }).text,
          isCorrect: (option as { isCorrect: boolean }).isCorrect,
        });
      }
    }

    if (options.length === 0) {
      throw new BadRequestException('Question options payload is empty or invalid');
    }

    return options;
  }
}
