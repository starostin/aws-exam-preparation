import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  type CompleteQuizAttemptResponse,
  type PublicQuizOption,
  type QuestionDifficulty,
  type QuizAttemptProgressResponse,
  type QuizAttemptQuestionsPageResponse,
  type QuizAttemptSummary,
  type QuizMode,
  type QuizQuestionItem,
  type QuizQuestionSelection,
  type QuizSessionStatus,
  type QuizStatsResponse,
  type QuizTopicStats,
  type QuizTopicSummary,
  type StartQuizAttemptResponse,
  type SubmitQuizAnswerResponse,
  type SubmitQuizAttemptResponse,
} from '@aws-exam-prep/types';
import * as schema from '../../database/schema';
import { DRIZZLE } from '../database/database.module';
import type { ListQuizAttemptHistoryDto } from './dto/list-quiz-attempt-history.dto';
import type { ListQuizAttemptQuestionsDto } from './dto/list-quiz-attempt-questions.dto';
import type { ListQuizQuestionsDto } from './dto/list-quiz-questions.dto';
import type { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import type { SubmitQuizAnswerDto } from './dto/submit-quiz-answer.dto';
import type { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';

interface RawQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AvailableQuizQuestionRow {
  id: string;
  certificationId: string;
  topicId: string;
  topicTitle: string;
  domainName: string;
  text: string;
  options: unknown;
  difficulty: QuestionDifficulty;
}

interface QuizAttemptSummaryRow {
  attemptId: string;
  certificationId: string;
  mode: QuizMode;
  questionSelection: QuizQuestionSelection;
  topicId: string | null;
  topicTitle: string | null;
  difficulty: QuestionDifficulty | null;
  status: QuizSessionStatus;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  startedAt: Date;
  completedAt: Date | null;
}

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async listTopics(certificationId?: string): Promise<QuizTopicSummary[]> {
    const certificationCondition = certificationId
      ? eq(schema.certifications.id, certificationId)
      : eq(schema.certifications.code, 'SAA-C03');

    const rows = await this.db
      .select({
        topicId: schema.topics.id,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
        questionCount: sql<number>`COUNT(${schema.quizQuestions.id})`,
      })
      .from(schema.quizQuestions)
      .innerJoin(schema.topics, eq(schema.quizQuestions.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .innerJoin(schema.certifications, eq(schema.domains.certificationId, schema.certifications.id))
      .where(certificationCondition)
      .groupBy(schema.topics.id, schema.topics.title, schema.domains.name)
      .orderBy(schema.domains.name, schema.topics.title);

    return rows.map((row) => ({
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      domainName: row.domainName,
      questionCount: Number(row.questionCount),
    }));
  }

  async listQuestions(userId: string, dto: ListQuizQuestionsDto): Promise<QuizQuestionItem[]> {
    const rows = await this.selectAvailableQuestions(userId, dto, dto.limit ?? 10);
    return rows.map((row) => this.toQuizQuestionItem(row));
  }

  async startAttempt(userId: string, dto: StartQuizAttemptDto): Promise<StartQuizAttemptResponse> {
    const mode = dto.mode ?? 'topic';
    const questionSelection = dto.selection ?? 'all';
    const questionRows = await this.selectAvailableQuestions(userId, dto, dto.limit);
    const firstQuestion = questionRows[0];

    if (!firstQuestion) {
      throw new BadRequestException(
        questionSelection === 'unanswered'
          ? 'No unanswered questions found for the selected filters'
          : 'No questions found for the selected filters',
      );
    }

    const now = new Date();

    const [attempt] = await this.db.transaction(async (tx) => {
      const [createdAttempt] = await tx
        .insert(schema.quizSessionAttempts)
        .values({
          userId,
          certificationId: firstQuestion.certificationId,
          topicId: mode === 'topic' ? (dto.topicId ?? null) : null,
          mode,
          questionSelection,
          difficulty: dto.difficulty ?? null,
          status: 'in_progress',
          totalQuestions: questionRows.length,
          startedAt: now,
          updatedAt: now,
        })
        .returning({
          attemptId: schema.quizSessionAttempts.id,
          certificationId: schema.quizSessionAttempts.certificationId,
          mode: schema.quizSessionAttempts.mode,
          questionSelection: schema.quizSessionAttempts.questionSelection,
          topicId: schema.quizSessionAttempts.topicId,
          difficulty: schema.quizSessionAttempts.difficulty,
          status: schema.quizSessionAttempts.status,
          totalQuestions: schema.quizSessionAttempts.totalQuestions,
          startedAt: schema.quizSessionAttempts.startedAt,
          completedAt: schema.quizSessionAttempts.completedAt,
        });

      if (!createdAttempt) {
        throw new BadRequestException('Failed to start quiz attempt');
      }

      await tx.insert(schema.quizSessionQuestions).values(
        questionRows.map((question, index) => ({
          attemptId: createdAttempt.attemptId,
          questionId: question.id,
          questionOrder: index + 1,
        })),
      );

      return [createdAttempt] as const;
    });

    return this.toQuizAttemptSummary({
      attemptId: attempt.attemptId,
      certificationId: attempt.certificationId,
      mode: attempt.mode as QuizMode,
      questionSelection: attempt.questionSelection as QuizQuestionSelection,
      topicId: attempt.topicId,
      topicTitle: mode === 'topic' ? firstQuestion.topicTitle : null,
      difficulty: attempt.difficulty as QuestionDifficulty | null,
      status: attempt.status as QuizSessionStatus,
      totalQuestions: Number(attempt.totalQuestions),
      answeredQuestions: 0,
      correctAnswers: 0,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    });
  }

  async listAttemptHistory(userId: string, dto: ListQuizAttemptHistoryDto): Promise<QuizAttemptSummary[]> {
    const conditions: SQL<unknown>[] = [eq(schema.quizSessionAttempts.userId, userId)];
    if (dto.certificationId) {
      conditions.push(eq(schema.quizSessionAttempts.certificationId, dto.certificationId));
    }

    const rows = await this.db
      .select({
        attemptId: schema.quizSessionAttempts.id,
        certificationId: schema.quizSessionAttempts.certificationId,
        mode: schema.quizSessionAttempts.mode,
        questionSelection: schema.quizSessionAttempts.questionSelection,
        topicId: schema.quizSessionAttempts.topicId,
        topicTitle: schema.topics.title,
        difficulty: schema.quizSessionAttempts.difficulty,
        status: schema.quizSessionAttempts.status,
        totalQuestions: schema.quizSessionAttempts.totalQuestions,
        answeredQuestions: sql<number>`COUNT(${schema.quizSessionQuestions.answeredAt})`,
        correctAnswers: sql<number>`COALESCE(SUM(CASE WHEN ${schema.quizSessionQuestions.isCorrect} THEN 1 ELSE 0 END), 0)`,
        startedAt: schema.quizSessionAttempts.startedAt,
        completedAt: schema.quizSessionAttempts.completedAt,
      })
      .from(schema.quizSessionAttempts)
      .leftJoin(schema.topics, eq(schema.quizSessionAttempts.topicId, schema.topics.id))
      .leftJoin(schema.quizSessionQuestions, eq(schema.quizSessionQuestions.attemptId, schema.quizSessionAttempts.id))
      .where(and(...conditions))
      .groupBy(
        schema.quizSessionAttempts.id,
        schema.quizSessionAttempts.certificationId,
        schema.quizSessionAttempts.mode,
        schema.quizSessionAttempts.questionSelection,
        schema.quizSessionAttempts.topicId,
        schema.topics.title,
        schema.quizSessionAttempts.difficulty,
        schema.quizSessionAttempts.status,
        schema.quizSessionAttempts.totalQuestions,
        schema.quizSessionAttempts.startedAt,
        schema.quizSessionAttempts.completedAt,
      )
      .orderBy(desc(schema.quizSessionAttempts.startedAt));

    return rows.map((row) => this.toQuizAttemptSummary({
      attemptId: row.attemptId,
      certificationId: row.certificationId,
      mode: row.mode as QuizMode,
      questionSelection: row.questionSelection as QuizQuestionSelection,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      difficulty: row.difficulty as QuestionDifficulty | null,
      status: row.status as QuizSessionStatus,
      totalQuestions: Number(row.totalQuestions),
      answeredQuestions: Number(row.answeredQuestions),
      correctAnswers: Number(row.correctAnswers),
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    }));
  }

  async getAttemptProgress(userId: string, attemptId: string): Promise<QuizAttemptProgressResponse> {
    return this.toQuizAttemptSummary(await this.getOwnedAttemptSummary(userId, attemptId));
  }

  async listAttemptQuestions(
    userId: string,
    attemptId: string,
    dto: ListQuizAttemptQuestionsDto,
  ): Promise<QuizAttemptQuestionsPageResponse> {
    await this.getOwnedAttemptSummary(userId, attemptId);

    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const totalRows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.quizSessionQuestions)
      .where(eq(schema.quizSessionQuestions.attemptId, attemptId));

    const rows = await this.db
      .select({
        attemptQuestionId: schema.quizSessionQuestions.id,
        questionOrder: schema.quizSessionQuestions.questionOrder,
        selectedOptionId: schema.quizSessionQuestions.selectedOptionId,
        answeredAt: schema.quizSessionQuestions.answeredAt,
        questionId: schema.quizQuestions.id,
        topicId: schema.quizQuestions.topicId,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
        text: schema.quizQuestions.text,
        options: schema.quizQuestions.options,
        difficulty: schema.quizQuestions.difficulty,
      })
      .from(schema.quizSessionQuestions)
      .innerJoin(schema.quizQuestions, eq(schema.quizSessionQuestions.questionId, schema.quizQuestions.id))
      .innerJoin(schema.topics, eq(schema.quizQuestions.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(eq(schema.quizSessionQuestions.attemptId, attemptId))
      .orderBy(schema.quizSessionQuestions.questionOrder)
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
    dto: SubmitQuizAnswerDto,
  ): Promise<SubmitQuizAnswerResponse> {
    const attempt = await this.getOwnedAttemptSummary(userId, attemptId);
    if (attempt.status === 'completed') {
      throw new BadRequestException('Cannot submit answers for completed quiz attempts');
    }

    const [row] = await this.db
      .select({
        attemptQuestionId: schema.quizSessionQuestions.id,
        existingSelectedOptionId: schema.quizSessionQuestions.selectedOptionId,
        options: schema.quizQuestions.options,
        explanation: schema.quizQuestions.explanation,
      })
      .from(schema.quizSessionQuestions)
      .innerJoin(schema.quizQuestions, eq(schema.quizSessionQuestions.questionId, schema.quizQuestions.id))
      .where(
        and(
          eq(schema.quizSessionQuestions.attemptId, attemptId),
          eq(schema.quizSessionQuestions.questionId, dto.questionId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException('Question not found in this attempt');
    }

    if (row.existingSelectedOptionId) {
      throw new BadRequestException('Question was already answered in this attempt');
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
    const answeredAt = new Date();

    const [savedAnswer] = await this.db.transaction(async (tx) => {
      const [updatedQuestion] = await tx
        .update(schema.quizSessionQuestions)
        .set({
          selectedOptionId: selectedOption.id,
          isCorrect,
          answeredAt,
          updatedAt: answeredAt,
        })
        .where(eq(schema.quizSessionQuestions.id, row.attemptQuestionId))
        .returning({ answeredAt: schema.quizSessionQuestions.answeredAt });

      if (!updatedQuestion?.answeredAt) {
        throw new BadRequestException('Failed to save quiz answer');
      }

      await tx.insert(schema.quizAttempts).values({
        userId,
        questionId: dto.questionId,
        selectedOptionId: selectedOption.id,
        isCorrect,
        attemptedAt: answeredAt,
      });

      await tx
        .insert(schema.questionStates)
        .values({
          userId,
          questionId: dto.questionId,
          latestSelectedOptionId: selectedOption.id,
          latestIsCorrect: isCorrect,
          attemptsCount: 1,
          firstAnsweredAt: answeredAt,
          lastAnsweredAt: answeredAt,
          lastIncorrectAt: isCorrect ? null : answeredAt,
          updatedAt: answeredAt,
        })
        .onConflictDoUpdate({
          target: [schema.questionStates.userId, schema.questionStates.questionId],
          set: {
            latestSelectedOptionId: selectedOption.id,
            latestIsCorrect: isCorrect,
            attemptsCount: sql`${schema.questionStates.attemptsCount} + 1`,
            lastAnsweredAt: answeredAt,
            lastIncorrectAt: isCorrect ? sql`${schema.questionStates.lastIncorrectAt}` : answeredAt,
            updatedAt: answeredAt,
          },
        });

      await tx
        .update(schema.quizSessionAttempts)
        .set({ updatedAt: answeredAt })
        .where(eq(schema.quizSessionAttempts.id, attemptId));

      if (!updatedQuestion.answeredAt) {
        throw new BadRequestException('Failed to save quiz answer');
      }

      return [updatedQuestion] as const;
    });

    const answeredAtValue = savedAnswer.answeredAt;
    if (!answeredAtValue) {
      throw new BadRequestException('Failed to save quiz answer');
    }

    return {
      attemptId,
      questionId: dto.questionId,
      selectedOptionId: selectedOption.id,
      isCorrect,
      correctOptionId: correctOption.id,
      explanation: row.explanation,
      answeredAt: answeredAtValue.toISOString(),
    };
  }

  async completeAttempt(userId: string, attemptId: string): Promise<CompleteQuizAttemptResponse> {
    const attempt = await this.getOwnedAttemptSummary(userId, attemptId);
    if (attempt.status === 'completed' && attempt.completedAt) {
      return {
        attemptId: attempt.attemptId,
        status: attempt.status,
        totalQuestions: attempt.totalQuestions,
        answeredQuestions: attempt.answeredQuestions,
        correctAnswers: attempt.correctAnswers,
        accuracy: attempt.answeredQuestions > 0 ? attempt.correctAnswers / attempt.answeredQuestions : 0,
        completedAt: attempt.completedAt.toISOString(),
      };
    }

    if (attempt.answeredQuestions !== attempt.totalQuestions) {
      throw new BadRequestException('All questions must be answered before completing the quiz');
    }

    const completedAt = new Date();
    const [updatedAttempt] = await this.db
      .update(schema.quizSessionAttempts)
      .set({
        status: 'completed',
        completedAt,
        updatedAt: completedAt,
      })
      .where(eq(schema.quizSessionAttempts.id, attemptId))
      .returning({
        status: schema.quizSessionAttempts.status,
        completedAt: schema.quizSessionAttempts.completedAt,
      });

    if (!updatedAttempt?.completedAt) {
      throw new BadRequestException('Failed to complete quiz attempt');
    }

    return {
      attemptId,
      status: updatedAttempt.status as QuizSessionStatus,
      totalQuestions: attempt.totalQuestions,
      answeredQuestions: attempt.answeredQuestions,
      correctAnswers: attempt.correctAnswers,
      accuracy: attempt.answeredQuestions > 0 ? attempt.correctAnswers / attempt.answeredQuestions : 0,
      completedAt: updatedAttempt.completedAt.toISOString(),
    };
  }

  async submitAttempt(userId: string, dto: SubmitQuizAttemptDto): Promise<SubmitQuizAttemptResponse> {
    const [question] = await this.db
      .select({
        id: schema.quizQuestions.id,
        topicId: schema.quizQuestions.topicId,
        topicTitle: schema.topics.title,
        options: schema.quizQuestions.options,
        explanation: schema.quizQuestions.explanation,
        difficulty: schema.quizQuestions.difficulty,
      })
      .from(schema.quizQuestions)
      .innerJoin(schema.topics, eq(schema.quizQuestions.topicId, schema.topics.id))
      .where(eq(schema.quizQuestions.id, dto.questionId))
      .limit(1);

    if (!question) {
      throw new NotFoundException('Quiz question not found');
    }

    const options = this.parseOptions(question.options);
    const selected = options.find((option) => option.id === dto.selectedOptionId);
    if (!selected) {
      throw new BadRequestException('Selected option does not belong to this question');
    }

    const correctOption = options.find((option) => option.isCorrect);
    if (!correctOption) {
      throw new BadRequestException('Question has no correct option configured');
    }

    const isCorrect = selected.id === correctOption.id;
    const attemptedAt = new Date();

    const [attempt] = await this.db.transaction(async (tx) => {
      const [createdAttempt] = await tx
        .insert(schema.quizAttempts)
        .values({
          userId,
          questionId: question.id,
          selectedOptionId: selected.id,
          isCorrect,
          attemptedAt,
        })
        .returning({
          id: schema.quizAttempts.id,
          attemptedAt: schema.quizAttempts.attemptedAt,
        });

      if (!createdAttempt) {
        throw new BadRequestException('Failed to save quiz attempt');
      }

      await tx
        .insert(schema.questionStates)
        .values({
          userId,
          questionId: question.id,
          latestSelectedOptionId: selected.id,
          latestIsCorrect: isCorrect,
          attemptsCount: 1,
          firstAnsweredAt: attemptedAt,
          lastAnsweredAt: attemptedAt,
          lastIncorrectAt: isCorrect ? null : attemptedAt,
          updatedAt: attemptedAt,
        })
        .onConflictDoUpdate({
          target: [schema.questionStates.userId, schema.questionStates.questionId],
          set: {
            latestSelectedOptionId: selected.id,
            latestIsCorrect: isCorrect,
            attemptsCount: sql`${schema.questionStates.attemptsCount} + 1`,
            lastAnsweredAt: attemptedAt,
            lastIncorrectAt: isCorrect ? sql`${schema.questionStates.lastIncorrectAt}` : attemptedAt,
            updatedAt: attemptedAt,
          },
        });

      return [createdAttempt] as const;
    });

    return {
      attemptId: attempt.id,
      questionId: question.id,
      selectedOptionId: selected.id,
      isCorrect,
      correctOptionId: correctOption.id,
      explanation: question.explanation,
      topicId: question.topicId,
      topicTitle: question.topicTitle ?? null,
      difficulty: question.difficulty as QuestionDifficulty,
      attemptedAt: attempt.attemptedAt.toISOString(),
    };
  }

  async getStats(userId: string, topicId?: string): Promise<QuizStatsResponse> {
    const overallConditions = [eq(schema.quizAttempts.userId, userId)];
    const topicConditions = [eq(schema.quizAttempts.userId, userId)];

    if (topicId) {
      overallConditions.push(eq(schema.quizQuestions.topicId, topicId));
      topicConditions.push(eq(schema.quizQuestions.topicId, topicId));
    }

    const [overall] = await this.db
      .select({
        totalAttempts: sql<number>`COUNT(*)`,
        correctAttempts: sql<number>`SUM(CASE WHEN ${schema.quizAttempts.isCorrect} THEN 1 ELSE 0 END)`,
      })
      .from(schema.quizAttempts)
      .innerJoin(schema.quizQuestions, eq(schema.quizAttempts.questionId, schema.quizQuestions.id))
      .where(and(...overallConditions));

    const byTopicRows = await this.db
      .select({
        topicId: schema.quizQuestions.topicId,
        topicTitle: schema.topics.title,
        attempts: sql<number>`COUNT(*)`,
        correct: sql<number>`SUM(CASE WHEN ${schema.quizAttempts.isCorrect} THEN 1 ELSE 0 END)`,
      })
      .from(schema.quizAttempts)
      .innerJoin(schema.quizQuestions, eq(schema.quizAttempts.questionId, schema.quizQuestions.id))
      .innerJoin(schema.topics, eq(schema.quizQuestions.topicId, schema.topics.id))
      .where(and(...topicConditions))
      .groupBy(schema.quizQuestions.topicId, schema.topics.title)
      .orderBy(desc(sql<number>`COUNT(*)`), schema.topics.title);

    const totalAttempts = Number(overall?.totalAttempts ?? 0);
    const correctAttempts = Number(overall?.correctAttempts ?? 0);

    const byTopic: QuizTopicStats[] = byTopicRows.map((row) => {
      const attempts = Number(row.attempts);
      const correct = Number(row.correct);
      return {
        topicId: row.topicId,
        topicTitle: row.topicTitle,
        attempts,
        correct,
        accuracy: attempts > 0 ? correct / attempts : 0,
      };
    });

    return {
      totalAttempts,
      correctAttempts,
      accuracy: totalAttempts > 0 ? correctAttempts / totalAttempts : null,
      byTopic,
    };
  }

  async resetStats(userId: string): Promise<{ message: string }> {
    await this.db.transaction(async (tx) => {
      const sessionAttemptRows = await tx
        .select({ id: schema.quizSessionAttempts.id })
        .from(schema.quizSessionAttempts)
        .where(eq(schema.quizSessionAttempts.userId, userId));

      const sessionAttemptIds = sessionAttemptRows.map((row) => row.id);
      if (sessionAttemptIds.length > 0) {
        await tx
          .delete(schema.quizSessionQuestions)
          .where(inArray(schema.quizSessionQuestions.attemptId, sessionAttemptIds));
      }

      await tx.delete(schema.quizSessionAttempts).where(eq(schema.quizSessionAttempts.userId, userId));
      await tx.delete(schema.quizAttempts).where(eq(schema.quizAttempts.userId, userId));
      await tx.delete(schema.questionAttempts).where(eq(schema.questionAttempts.userId, userId));
      await tx.delete(schema.questionStates).where(eq(schema.questionStates.userId, userId));
    });

    return { message: 'Quiz stats reset successfully.' };
  }

  private async selectAvailableQuestions(
    userId: string,
    input: {
      mode?: QuizMode;
      topicId?: string;
      certificationId?: string;
      difficulty?: QuestionDifficulty;
      selection?: QuizQuestionSelection;
    },
    limit?: number,
  ): Promise<AvailableQuizQuestionRow[]> {
    const mode = input.mode ?? 'topic';
    if (mode === 'topic' && !input.topicId) {
      throw new BadRequestException('topicId is required when mode=topic');
    }

    const conditions: SQL<unknown>[] = [
      input.certificationId
        ? eq(schema.certifications.id, input.certificationId)
        : eq(schema.certifications.code, 'SAA-C03'),
    ];

    if (input.topicId) {
      conditions.push(eq(schema.quizQuestions.topicId, input.topicId));
    }

    if (input.difficulty) {
      conditions.push(eq(schema.quizQuestions.difficulty, input.difficulty));
    }

    if ((input.selection ?? 'all') === 'unanswered') {
      conditions.push(sql`${schema.questionStates.lastAnsweredAt} IS NULL`);
    }

    const query = this.db
      .select({
        id: schema.quizQuestions.id,
        certificationId: schema.certifications.id,
        topicId: schema.quizQuestions.topicId,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
        text: schema.quizQuestions.text,
        options: schema.quizQuestions.options,
        difficulty: schema.quizQuestions.difficulty,
      })
      .from(schema.quizQuestions)
      .innerJoin(schema.topics, eq(schema.quizQuestions.topicId, schema.topics.id))
      .innerJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .innerJoin(schema.certifications, eq(schema.domains.certificationId, schema.certifications.id))
      .leftJoin(
        schema.questionStates,
        and(
          eq(schema.questionStates.questionId, schema.quizQuestions.id),
          eq(schema.questionStates.userId, userId),
        ),
      )
      .where(and(...conditions))
      .orderBy(sql`random()`);

    const rows = limit ? await query.limit(limit) : await query;

    return rows.map((row) => ({
      id: row.id,
      certificationId: row.certificationId,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      domainName: row.domainName,
      text: row.text,
      options: row.options,
      difficulty: row.difficulty as QuestionDifficulty,
    }));
  }

  private async getOwnedAttemptSummary(userId: string, attemptId: string): Promise<QuizAttemptSummaryRow> {
    const [attempt] = await this.db
      .select({
        attemptId: schema.quizSessionAttempts.id,
        certificationId: schema.quizSessionAttempts.certificationId,
        mode: schema.quizSessionAttempts.mode,
        questionSelection: schema.quizSessionAttempts.questionSelection,
        topicId: schema.quizSessionAttempts.topicId,
        topicTitle: schema.topics.title,
        difficulty: schema.quizSessionAttempts.difficulty,
        status: schema.quizSessionAttempts.status,
        totalQuestions: schema.quizSessionAttempts.totalQuestions,
        answeredQuestions: sql<number>`COUNT(${schema.quizSessionQuestions.answeredAt})`,
        correctAnswers: sql<number>`COALESCE(SUM(CASE WHEN ${schema.quizSessionQuestions.isCorrect} THEN 1 ELSE 0 END), 0)`,
        startedAt: schema.quizSessionAttempts.startedAt,
        completedAt: schema.quizSessionAttempts.completedAt,
      })
      .from(schema.quizSessionAttempts)
      .leftJoin(schema.topics, eq(schema.quizSessionAttempts.topicId, schema.topics.id))
      .leftJoin(schema.quizSessionQuestions, eq(schema.quizSessionQuestions.attemptId, schema.quizSessionAttempts.id))
      .where(
        and(
          eq(schema.quizSessionAttempts.id, attemptId),
          eq(schema.quizSessionAttempts.userId, userId),
        ),
      )
      .groupBy(
        schema.quizSessionAttempts.id,
        schema.quizSessionAttempts.certificationId,
        schema.quizSessionAttempts.mode,
        schema.quizSessionAttempts.questionSelection,
        schema.quizSessionAttempts.topicId,
        schema.topics.title,
        schema.quizSessionAttempts.difficulty,
        schema.quizSessionAttempts.status,
        schema.quizSessionAttempts.totalQuestions,
        schema.quizSessionAttempts.startedAt,
        schema.quizSessionAttempts.completedAt,
      )
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    return {
      attemptId: attempt.attemptId,
      certificationId: attempt.certificationId,
      mode: attempt.mode as QuizMode,
      questionSelection: attempt.questionSelection as QuizQuestionSelection,
      topicId: attempt.topicId,
      topicTitle: attempt.topicTitle,
      difficulty: attempt.difficulty as QuestionDifficulty | null,
      status: attempt.status as QuizSessionStatus,
      totalQuestions: Number(attempt.totalQuestions),
      answeredQuestions: Number(attempt.answeredQuestions),
      correctAnswers: Number(attempt.correctAnswers),
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    };
  }

  private toQuizAttemptSummary(row: QuizAttemptSummaryRow): QuizAttemptSummary {
    return {
      attemptId: row.attemptId,
      certificationId: row.certificationId,
      mode: row.mode,
      questionSelection: row.questionSelection,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      difficulty: row.difficulty,
      status: row.status,
      totalQuestions: row.totalQuestions,
      answeredQuestions: row.answeredQuestions,
      correctAnswers: row.correctAnswers,
      accuracy: row.answeredQuestions > 0 ? row.correctAnswers / row.answeredQuestions : null,
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    };
  }

  private toQuizQuestionItem(row: AvailableQuizQuestionRow): QuizQuestionItem {
    return {
      id: row.id,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      domainName: row.domainName,
      text: row.text,
      options: this.toPublicOptions(row.options),
      difficulty: row.difficulty,
    };
  }

  private toPublicOptions(rawOptions: unknown): PublicQuizOption[] {
    return this.parseOptions(rawOptions).map((option) => ({
      id: option.id,
      text: option.text,
    }));
  }

  private parseOptions(rawOptions: unknown): RawQuizOption[] {
    if (!Array.isArray(rawOptions)) {
      throw new BadRequestException('Question options payload is invalid');
    }

    const options: RawQuizOption[] = [];
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