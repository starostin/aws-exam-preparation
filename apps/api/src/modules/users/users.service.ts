import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../../database/schema';

export interface AuthIdentity {
  id: string;
  email: string;
}

export type UserProfile = typeof schema.users.$inferSelect;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createOrUpdateFromAuthUser(identity: AuthIdentity): Promise<UserProfile> {
    const [user] = await this.db
      .insert(schema.users)
      .values({
        id: identity.id,
        email: identity.email,
      })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          email: identity.email,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!user) {
      throw new NotFoundException('Unable to create or update user profile');
    }

    return user;
  }

  async getMe(identity: AuthIdentity): Promise<UserProfile> {
    const user = await this.findById(identity.id);
    if (user) return user;
    return this.createOrUpdateFromAuthUser(identity);
  }

  async updateMe(userId: string, displayName: string | null): Promise<UserProfile> {
    const [user] = await this.db
      .update(schema.users)
      .set({
        displayName,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  private async findById(userId: string): Promise<UserProfile | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    return user ?? null;
  }
}
