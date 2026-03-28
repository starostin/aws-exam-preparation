import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';

type MaterialsQuery = {
  certificationId?: string;
  type?: 'docs' | 'video' | 'course' | 'practice_test';
  isFree?: boolean;
  provider?: string;
  search?: string;
};

export interface StudyMaterialItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  priority: number;
  isFree: boolean;
  provider: string | null;
  level: string | null;
  tags: string[];
  estimatedMinutes: number | null;
  topicTitle: string | null;
  domainName: string | null;
}

@Injectable()
export class MaterialsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async listStudyMaterials(query: MaterialsQuery): Promise<StudyMaterialItem[]> {
    const certificationId = query.certificationId;
    const conditions = [
      certificationId
        ? eq(schema.certifications.id, certificationId)
        : eq(schema.certifications.code, 'SAA-C03'),
    ];

    if (query.type) {
      conditions.push(eq(schema.externalResources.type, query.type));
    }

    if (query.isFree !== undefined) {
      conditions.push(eq(schema.externalResources.isFree, query.isFree));
    }

    if (query.provider?.trim()) {
      conditions.push(eq(schema.externalResources.provider, query.provider.trim()));
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.externalResources.title, term),
          ilike(schema.externalResources.description, term),
          ilike(schema.externalResources.provider, term),
        )!,
      );
    }

    const rows = await this.db
      .select({
        id: schema.externalResources.id,
        title: schema.externalResources.title,
        description: schema.externalResources.description,
        url: schema.externalResources.url,
        type: schema.externalResources.type,
        priority: schema.externalResources.priority,
        isFree: schema.externalResources.isFree,
        provider: schema.externalResources.provider,
        level: schema.externalResources.level,
        tags: schema.externalResources.tags,
        estimatedMinutes: schema.externalResources.estimatedMinutes,
        topicTitle: schema.topics.title,
        domainName: schema.domains.name,
      })
      .from(schema.externalResources)
      .innerJoin(
        schema.certifications,
        eq(schema.externalResources.certificationId, schema.certifications.id),
      )
      .leftJoin(schema.topics, eq(schema.externalResources.topicId, schema.topics.id))
      .leftJoin(schema.domains, eq(schema.topics.domainId, schema.domains.id))
      .where(and(...conditions))
      .orderBy(
        desc(schema.externalResources.priority),
        desc(schema.externalResources.isFree),
        schema.externalResources.type,
        schema.externalResources.title,
      );

    return rows.map((row) => ({
      ...row,
      tags: Array.isArray(row.tags) ? (row.tags) : [],
    }));
  }
}
