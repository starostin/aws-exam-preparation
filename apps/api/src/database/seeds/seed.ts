import { and, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import * as schema from '../schema';
import {
  SAA_CERTIFICATION,
  SAA_DOMAINS,
  SAA_RESOURCES,
  SAA_TOPICS,
  type SeedDomain,
  type SeedResource,
  type SeedTopic,
} from './data/saa-c03-materials';
import { WAF_CATALOG } from './data/saa-c03-well-architected';
import { TD_CATALOG } from './data/saa-c03-tutorials-dojo';
import { SAA_STUDY_PLANS } from './data/saa-c03-study-plans';
import { SAA_QUIZ_QUESTIONS, type SeedQuizQuestion } from './data/saa-c03-quizzes';
import { SAA_C03_QUESTIONS } from './data/saa-c03-questions';
import { SAA_FLASHCARDS, type SeedFlashcard } from './data/saa-c03-flashcards';
import { SAA_MOCK_EXAMS, SAA_MOCK_EXAM_QUESTIONS, type SeedMockExam, type SeedMockExamQuestion } from './data/saa-c03-mock-exams';

type CertificationRow = typeof schema.certifications.$inferSelect;
type DomainRow = typeof schema.domains.$inferSelect;
type TopicRow = typeof schema.topics.$inferSelect;
type ExternalResourceRow = typeof schema.externalResources.$inferSelect;

function normalizeLegacyQuestionOptions(answerVariants: string[], correct: 'A' | 'B' | 'C' | 'D'): SeedQuizQuestion['options'] {
  return answerVariants
    .map((variant, index) => {
      const match = variant.match(/^\s*([A-D])[.)]\s*(.+)$/i);
      const letter = (match?.[1]?.toLowerCase() ?? ['a', 'b', 'c', 'd'][index] ?? 'a');
      const text = (match?.[2] ?? variant).trim();

      return {
        id: letter,
        text,
        isCorrect: letter === correct.toLowerCase(),
      };
    })
    .filter((option) => option.text.length > 0);
}

function buildSaaC03QuestionsFromLegacySource(): SeedQuizQuestion[] {
  return SAA_C03_QUESTIONS
    .filter((question) => Array.isArray(question.answerVariants) && question.answerVariants.length > 0)
    .map((question) => ({
      topicSlug: question.topicSlug,
      text: question.question,
      options: normalizeLegacyQuestionOptions(question.answerVariants, question.correctAnswerVariant),
      explanation: question.answer,
      difficulty: 'medium' as const,
    }))
    .filter((question) => question.options.length > 0);
}

function getDefaultResourcePriority(resource: SeedResource): number {
  if (resource.priority != null) {
    // Seed data uses 1 (MUST-HAVE) → 3 (OPTIONAL); DB uses higher = more important (0–100).
    switch (resource.priority) {
    case 1: return 90;
    case 2: return 70;
    case 3: return 50;
    default: return 60;
    }
  }

  // Fallback by type for any resource without an explicit priority.
  switch (resource.type) {
  case 'course':
    return 90;
  case 'practice_test':
    return 85;
  case 'video':
    return 75;
  case 'docs':
  default:
    return 65;
  }
}

function getDatabaseUrl(): string {
  const dbUrl = process.env['DATABASE_URL'];
  if (!dbUrl) {
    throw new Error('DATABASE_URL is required to run seeds.');
  }
  return dbUrl;
}

async function getOrCreateCertification(db: ReturnType<typeof drizzle>): Promise<CertificationRow> {
  const [existing] = await db
    .select()
    .from(schema.certifications)
    .where(eq(schema.certifications.code, SAA_CERTIFICATION.code))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.certifications)
      .set({
        name: SAA_CERTIFICATION.name,
        provider: SAA_CERTIFICATION.provider,
        updatedAt: new Date(),
      })
      .where(eq(schema.certifications.id, existing.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db
    .insert(schema.certifications)
    .values(SAA_CERTIFICATION)
    .returning();

  if (!created) {
    throw new Error('Failed to create SAA-C03 certification.');
  }

  return created;
}

async function getOrCreateDomain(
  db: ReturnType<typeof drizzle>,
  certificationId: string,
  domain: SeedDomain,
): Promise<DomainRow> {
  const [existing] = await db
    .select()
    .from(schema.domains)
    .where(and(eq(schema.domains.certificationId, certificationId), eq(schema.domains.name, domain.name)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.domains)
      .set({
        weightPercent: domain.weightPercent,
        updatedAt: new Date(),
      })
      .where(eq(schema.domains.id, existing.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db
    .insert(schema.domains)
    .values({
      certificationId,
      name: domain.name,
      weightPercent: domain.weightPercent,
    })
    .returning();

  if (!created) {
    throw new Error(`Failed to create domain: ${domain.name}`);
  }

  return created;
}

async function getOrCreateTopic(
  db: ReturnType<typeof drizzle>,
  domainId: string,
  topic: SeedTopic,
): Promise<TopicRow> {
  const [existing] = await db
    .select()
    .from(schema.topics)
    .where(and(eq(schema.topics.domainId, domainId), eq(schema.topics.title, topic.title)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.topics)
      .set({
        content: topic.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.topics.id, existing.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db
    .insert(schema.topics)
    .values({
      domainId,
      title: topic.title,
      content: topic.content,
    })
    .returning();

  if (!created) {
    throw new Error(`Failed to create topic: ${topic.title}`);
  }

  return created;
}

async function clearResourcesForCertification(
  db: ReturnType<typeof drizzle>,
  certificationId: string,
): Promise<void> {
  await db
    .delete(schema.externalResources)
    .where(eq(schema.externalResources.certificationId, certificationId));
}

async function getExistingResource(
  db: ReturnType<typeof drizzle>,
  certificationId: string,
  topicId: string | null,
  url: string,
): Promise<ExternalResourceRow | null> {
  if (topicId) {
    const [existing] = await db
      .select()
      .from(schema.externalResources)
      .where(
        and(
          eq(schema.externalResources.certificationId, certificationId),
          eq(schema.externalResources.topicId, topicId),
          eq(schema.externalResources.url, url),
        ),
      )
      .limit(1);
    return existing ?? null;
  }

  const [existing] = await db
    .select()
    .from(schema.externalResources)
    .where(
      and(
        eq(schema.externalResources.certificationId, certificationId),
        isNull(schema.externalResources.topicId),
        eq(schema.externalResources.url, url),
      ),
    )
    .limit(1);

  return existing ?? null;
}

async function upsertResource(
  db: ReturnType<typeof drizzle>,
  certificationId: string,
  topicId: string | null,
  resource: SeedResource,
): Promise<void> {
  const existing = await getExistingResource(db, certificationId, topicId, resource.url);

  if (existing) {
    await db
      .update(schema.externalResources)
      .set({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        priority: getDefaultResourcePriority(resource),
        isFree: resource.isFree,
        provider: resource.provider,
        level: resource.level,
        tags: resource.tags,
        estimatedMinutes: resource.estimatedMinutes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.externalResources.id, existing.id));

    return;
  }

  await db.insert(schema.externalResources).values({
    certificationId,
    topicId,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    type: resource.type,
    priority: getDefaultResourcePriority(resource),
    isFree: resource.isFree,
    provider: resource.provider,
    level: resource.level,
    tags: resource.tags,
    estimatedMinutes: resource.estimatedMinutes ?? null,
  });
}

async function upsertFlashcard(
  db: ReturnType<typeof drizzle>,
  topicId: string,
  card: SeedFlashcard,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(schema.flashcards)
    .where(and(eq(schema.flashcards.topicId, topicId), eq(schema.flashcards.front, card.front)))
    .limit(1);

  if (existing) {
    await db
      .update(schema.flashcards)
      .set({
        back: card.back,
        updatedAt: new Date(),
      })
      .where(eq(schema.flashcards.id, existing.id));
    return;
  }

  await db.insert(schema.flashcards).values({
    topicId,
    front: card.front,
    back: card.back,
  });
}

async function upsertQuizQuestion(
  db: ReturnType<typeof drizzle>,
  topicId: string,
  question: SeedQuizQuestion,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(schema.quizQuestions)
    .where(and(eq(schema.quizQuestions.topicId, topicId), eq(schema.quizQuestions.text, question.text)))
    .limit(1);

  if (existing) {
    await db
      .update(schema.quizQuestions)
      .set({
        options: question.options,
        explanation: question.explanation,
        difficulty: question.difficulty,
        updatedAt: new Date(),
      })
      .where(eq(schema.quizQuestions.id, existing.id));
    return;
  }

  await db.insert(schema.quizQuestions).values({
    topicId,
    text: question.text,
    options: question.options,
    explanation: question.explanation,
    difficulty: question.difficulty,
  });
}

async function upsertMockExam(
  db: ReturnType<typeof drizzle>,
  certificationId: string,
  exam: SeedMockExam,
): Promise<typeof schema.mockExams.$inferSelect> {
  const [existing] = await db
    .select()
    .from(schema.mockExams)
    .where(and(eq(schema.mockExams.certificationId, certificationId), eq(schema.mockExams.title, exam.title)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.mockExams)
      .set({
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        updatedAt: new Date(),
      })
      .where(eq(schema.mockExams.id, existing.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db
    .insert(schema.mockExams)
    .values({
      certificationId,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
    })
    .returning();

  if (!created) {
    throw new Error(`Failed to create mock exam: ${exam.title}`);
  }

  return created;
}

async function upsertMockExamQuestion(
  db: ReturnType<typeof drizzle>,
  mockExamId: string,
  topicId: string,
  question: SeedMockExamQuestion,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(schema.mockExamQuestions)
    .where(and(eq(schema.mockExamQuestions.mockExamId, mockExamId), eq(schema.mockExamQuestions.text, question.text)))
    .limit(1);

  if (existing) {
    await db
      .update(schema.mockExamQuestions)
      .set({
        topicId,
        options: question.options,
        explanation: question.explanation,
        difficulty: question.difficulty,
        updatedAt: new Date(),
      })
      .where(eq(schema.mockExamQuestions.id, existing.id));
    return;
  }

  await db.insert(schema.mockExamQuestions).values({
    mockExamId,
    topicId,
    text: question.text,
    options: question.options,
    explanation: question.explanation,
    difficulty: question.difficulty,
  });
}

async function runSeed(): Promise<void> {
  dotenv.config({ path: '.env.local' });
  dotenv.config();

  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: process.env['NODE_ENV'] === 'production' ? { rejectUnauthorized: true } : false,
  });

  const db = drizzle(pool, { schema });

  try {
    const certification = await getOrCreateCertification(db);

    const domainIdBySlug = new Map<string, string>();
    for (const domain of SAA_DOMAINS) {
      const seededDomain = await getOrCreateDomain(db, certification.id, domain);
      domainIdBySlug.set(domain.slug, seededDomain.id);
    }

    const topicIdBySlug = new Map<string, string>();
    for (const topic of SAA_TOPICS) {
      const domainId = domainIdBySlug.get(topic.domainSlug);
      if (!domainId) {
        throw new Error(`Missing domain for topic ${topic.slug}`);
      }

      const seededTopic = await getOrCreateTopic(db, domainId, topic);
      topicIdBySlug.set(topic.slug, seededTopic.id);
    }

    await clearResourcesForCertification(db, certification.id);

    // For WAF and TD, resource.title = collection.resourceTitle so the study-plan
    // template resolver (resourceByTitle map) and the service section-title lookup
    // both work. The per-section display title is resolved at scheduling time.
    const SAA_WAF_RESOURCES: SeedResource[] = WAF_CATALOG.flatMap(collection =>
      collection.sections.map(section => ({
        title: collection.resourceTitle,
        description: section.description,
        url: section.url,
        type: collection.type,
        priority: collection.priority,
        isFree: collection.isFree,
        provider: collection.provider,
        level: collection.level,
        tags: section.tags,
        estimatedMinutes: section.estimatedMinutes,
        topicSlug: section.topicSlug,
      }))
    );

    const SAA_TD_RESOURCES: SeedResource[] = TD_CATALOG.flatMap(collection =>
      collection.sections.map(section => ({
        title: collection.resourceTitle,
        description: section.description,
        url: section.url,
        type: collection.type,
        priority: collection.priority,
        isFree: collection.isFree,
        provider: collection.provider,
        level: collection.level,
        tags: section.tags,
        estimatedMinutes: section.estimatedMinutes,
        topicSlug: section.topicSlug,
      }))
    );

    const allSeedResources: SeedResource[] = [...SAA_RESOURCES, ...SAA_WAF_RESOURCES, ...SAA_TD_RESOURCES];

    for (const resource of allSeedResources) {
      const topicId = resource.topicSlug ? topicIdBySlug.get(resource.topicSlug) ?? null : null;

      if (resource.topicSlug && !topicId) {
        throw new Error(`Missing topic for resource ${resource.title} (${resource.topicSlug})`);
      }

      await upsertResource(db, certification.id, topicId, resource);
    }

    const legacyQuizQuestions = buildSaaC03QuestionsFromLegacySource();

    let skippedCoreQuizQuestions = 0;
    let insertedCoreQuizQuestions = 0;
    for (const question of SAA_QUIZ_QUESTIONS) {
      const topicId = topicIdBySlug.get(question.topicSlug);
      if (!topicId) {
        skippedCoreQuizQuestions += 1;
        continue;
      }

      await upsertQuizQuestion(db, topicId, question);
      insertedCoreQuizQuestions += 1;
    }

    let skippedLegacyQuizQuestions = 0;
    let insertedLegacyQuizQuestions = 0;
    for (const question of legacyQuizQuestions) {
      const topicId = topicIdBySlug.get(question.topicSlug);
      if (!topicId) {
        skippedLegacyQuizQuestions += 1;
        continue;
      }

      await upsertQuizQuestion(db, topicId, question);
      insertedLegacyQuizQuestions += 1;
    }

    for (const card of SAA_FLASHCARDS) {
      const topicId = topicIdBySlug.get(card.topicSlug);
      if (!topicId) {
        throw new Error(`Missing topic for flashcard (topicSlug: ${card.topicSlug})`);
      }
      await upsertFlashcard(db, topicId, card);
    }

    const mockExamIdBySlug = new Map<string, string>();
    for (const exam of SAA_MOCK_EXAMS) {
      const seededExam = await upsertMockExam(db, certification.id, exam);
      mockExamIdBySlug.set(exam.slug, seededExam.id);
    }

    for (const question of SAA_MOCK_EXAM_QUESTIONS) {
      const mockExamId = mockExamIdBySlug.get(question.examSlug);
      if (!mockExamId) {
        throw new Error(`Missing mock exam for question (examSlug: ${question.examSlug})`);
      }

      const topicId = topicIdBySlug.get(question.topicSlug);
      if (!topicId) {
        throw new Error(`Missing topic for mock exam question (topicSlug: ${question.topicSlug})`);
      }

      await upsertMockExamQuestion(db, mockExamId, topicId, question);
    }

    // Keep output concise for CI/local usage while still showing seed coverage.
    // eslint-disable-next-line no-console
    console.log(`Seed completed: ${SAA_DOMAINS.length} domains, ${SAA_TOPICS.length} topics, ${allSeedResources.length} resources (${SAA_RESOURCES.length} core + ${SAA_WAF_RESOURCES.length} WAF + ${SAA_TD_RESOURCES.length} TD cheat sheets), ${SAA_STUDY_PLANS.length} plan templates (static), ${insertedCoreQuizQuestions + insertedLegacyQuizQuestions} quiz questions (${insertedCoreQuizQuestions} core + ${insertedLegacyQuizQuestions} legacy, ${skippedCoreQuizQuestions + skippedLegacyQuizQuestions} skipped unknown-topic), ${SAA_FLASHCARDS.length} flashcards, ${SAA_MOCK_EXAMS.length} mock exams, ${SAA_MOCK_EXAM_QUESTIONS.length} mock exam questions.`);
  } finally {
    await pool.end();
  }
}

runSeed().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
