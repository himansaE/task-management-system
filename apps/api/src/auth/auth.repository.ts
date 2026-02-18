import { Injectable } from '@nestjs/common';
import { eq, users } from '@repo/database';
import { DatabaseService } from '../database/database.service';

export type AuthUserRecord = typeof users.$inferSelect;

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByEmail(email: string) {
    const rows = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return rows[0] ?? null;
  }

  async findById(userId: string) {
    const rows = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(input: {
    email: string;
    name: string;
    passwordHash: string;
    tokenVersion: number;
  }) {
    const rows = await this.databaseService.db
      .insert(users)
      .values(input)
      .returning();
    return rows[0];
  }

  async updateTokenVersion(userId: string, tokenVersion: number) {
    const rows = await this.databaseService.db
      .update(users)
      .set({ tokenVersion, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return rows[0] ?? null;
  }
}
