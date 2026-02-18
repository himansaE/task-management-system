import { Injectable } from '@nestjs/common';
import { desc, eq, tasks } from '@repo/database';
import { DatabaseService } from '../database/database.service';

export type TaskRecord = typeof tasks.$inferSelect;

@Injectable()
export class TasksRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listByOwnerId(ownerId: string) {
    return this.databaseService.db
      .select()
      .from(tasks)
      .where(eq(tasks.ownerId, ownerId))
      .orderBy(desc(tasks.createdAt));
  }

  async findById(taskId: string) {
    const rows = await this.databaseService.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(input: typeof tasks.$inferInsert) {
    const rows = await this.databaseService.db
      .insert(tasks)
      .values(input)
      .returning();
    return rows[0];
  }

  async updateById(taskId: string, values: Partial<typeof tasks.$inferInsert>) {
    const rows = await this.databaseService.db
      .update(tasks)
      .set(values)
      .where(eq(tasks.id, taskId))
      .returning();

    return rows[0] ?? null;
  }

  async deleteById(taskId: string) {
    await this.databaseService.db.delete(tasks).where(eq(tasks.id, taskId));
  }
}
