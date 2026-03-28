import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  type QuestionDifficulty,
  type PublicQuizOption,
  type QuizQuestionItem,
  type QuizStatsResponse,
  type QuizTopicStats,
  type QuizTopicSummary,
  type SubmitQuizAttemptResponse,
} from '@aws-exam-prep/types';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';
import type { ListQuizQuestionsDto } from './dto/list-quiz-questions.dto';
import type { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';

interface RawQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
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

  async listQuestions(dto: ListQuizQuestionsDto): Promise<QuizQuestionItem[]> {
    const mode = dto.mode ?? 'topic';
    if (mode === 'topic' && !dto.topicId) {
      throw new BadRequestException('topicId is required when mode=topic');
    }

    const conditions = [
      dto.certificationId
        ? eq(schema.certifications.id, dto.certificationId)
        : eq(schema.certifications.code, 'SAA-C03'),
    ];

    if (dto.topicId) {
      conditions.push(eq(schema.quizQuestions.topicId, dto.topicId));
    }

    if (dto.difficulty) {
      conditions.push(eq(schema.quizQuestions.difficulty, dto.difficulty));
    }

    const rows = await this.db
      .select({
        id: schema.quizQuestions.id,
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
      .where(and(...conditions))
      .orderBy(sql`random()`)
      .limit(dto.limit ?? 10);

    return rows.map((row) => ({
      id: row.id,
      topicId: row.topicId,
      topicTitle: row.topicTitle,
      domainName: row.domainName,
      text: row.text,
      options: this.toPublicOptions(row.options),
      difficulty: row.difficulty as QuestionDifficulty,
    }));
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

    const [attempt] = await this.db
      .insert(schema.quizAttempts)
      .values({
        userId,
        questionId: question.id,
        selectedOptionId: selected.id,
        isCorrect,
      })
      .returning({
        id: schema.quizAttempts.id,
        attemptedAt: schema.quizAttempts.attemptedAt,
      });

    if (!attempt) {
      throw new BadRequestException('Failed to save quiz attempt');
    }

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
