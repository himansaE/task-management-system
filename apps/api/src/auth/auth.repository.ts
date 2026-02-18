import { Injectable } from '@nestjs/common';
import { and, authSessions, eq, gt, isNull, users } from '@repo/database';
import { DatabaseService } from '../database/database.service';

export type AuthUserRecord = typeof users.$inferSelect;
export type AuthSessionRecord = typeof authSessions.$inferSelect;

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

  async create(input: { email: string; name: string; passwordHash: string }) {
    const rows = await this.databaseService.db
      .insert(users)
      .values(input)
      .returning();
    return rows[0];
  }

  async createSession(input: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }) {
    const rows = await this.databaseService.db
      .insert(authSessions)
      .values(input)
      .returning();

    return rows[0] ?? null;
  }

  async findActiveSession(sessionId: string, userId: string) {
    const now = new Date();

    const rows = await this.databaseService.db
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.id, sessionId),
          eq(authSessions.userId, userId),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, now),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async rotateSession(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ) {
    const rows = await this.databaseService.db
      .update(authSessions)
      .set({ refreshTokenHash, expiresAt, updatedAt: new Date() })
      .where(eq(authSessions.id, sessionId))
      .returning();

    return rows[0] ?? null;
  }

  async revokeSession(sessionId: string, userId: string) {
    const rows = await this.databaseService.db
      .update(authSessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(authSessions.id, sessionId),
          eq(authSessions.userId, userId),
          isNull(authSessions.revokedAt),
        ),
      )
      .returning();

    return rows[0] ?? null;
  }

  async revokeAllSessions(userId: string) {
    await this.databaseService.db
      .update(authSessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)),
      );
  }
}
