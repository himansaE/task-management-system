import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, tasks } from '@repo/database';
import { ListTasksQueryInput } from '@repo/contract';
import { DatabaseService } from '../database/database.service';

export type TaskRecord = typeof tasks.$inferSelect;

@Injectable()
export class TasksRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listByOwnerId(ownerId: string, query: ListTasksQueryInput) {
    const conditions = [eq(tasks.ownerId, ownerId)];

    if (query.status) {
      conditions.push(eq(tasks.status, query.status));
    }

    if (query.priority) {
      conditions.push(eq(tasks.priority, query.priority));
    }

    const whereClause = and(...conditions);
    const offset = (query.page - 1) * query.limit;

    const rows = await this.databaseService.db
      .select()
      .from(tasks)
      .where(whereClause)
      .limit(query.limit)
      .offset(offset)
      .orderBy(desc(tasks.createdAt));

    const countRows = await this.databaseService.db
      .select({ total: count() })
      .from(tasks)
      .where(whereClause);

    return {
      items: rows,
      total: Number(countRows[0]?.total ?? 0),
    };
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

  async updateByIdForOwner(
    ownerId: string,
    taskId: string,
    values: Partial<typeof tasks.$inferInsert>,
  ) {
    const rows = await this.databaseService.db
      .update(tasks)
      .set(values)
      .where(and(eq(tasks.id, taskId), eq(tasks.ownerId, ownerId)))
      .returning();

    return rows[0] ?? null;
  }

  async deleteByIdForOwner(ownerId: string, taskId: string) {
    const rows = await this.databaseService.db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.ownerId, ownerId)))
      .returning({ id: tasks.id });

    return rows.length > 0;
  }
}
