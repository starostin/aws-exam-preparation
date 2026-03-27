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

type CertificationRow = typeof schema.certifications.$inferSelect;
type DomainRow = typeof schema.domains.$inferSelect;
type TopicRow = typeof schema.topics.$inferSelect;
type ExternalResourceRow = typeof schema.externalResources.$inferSelect;

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
    isFree: resource.isFree,
    provider: resource.provider,
    level: resource.level,
    tags: resource.tags,
    estimatedMinutes: resource.estimatedMinutes ?? null,
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

    for (const resource of SAA_RESOURCES) {
      const topicId = resource.topicSlug ? topicIdBySlug.get(resource.topicSlug) ?? null : null;

      if (resource.topicSlug && !topicId) {
        throw new Error(`Missing topic for resource ${resource.title} (${resource.topicSlug})`);
      }

      await upsertResource(db, certification.id, topicId, resource);
    }

    // Keep output concise for CI/local usage while still showing seed coverage.
    // eslint-disable-next-line no-console
    console.log(`Seed completed: ${SAA_DOMAINS.length} domains, ${SAA_TOPICS.length} topics, ${SAA_RESOURCES.length} resources.`);
  } finally {
    await pool.end();
  }
}

runSeed().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
