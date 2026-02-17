import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskInput, TaskStatus, UpdateTaskInput } from '@repo/contract';
import { tasks } from '@repo/database';
import { randomUUID } from 'node:crypto';

type TaskRecord = typeof tasks.$inferSelect;

@Injectable()
export class TasksService {
  private readonly tasksById = new Map<string, TaskRecord>();

  list(userId: string) {
    return Array.from(this.tasksById.values()).filter((task) => task.ownerId === userId);
  }

  create(userId: string, input: CreateTaskInput) {
    const now = new Date();

    const task: TaskRecord = {
      id: randomUUID(),
      ownerId: userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: 'TODO' as TaskStatus,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdAt: now,
      updatedAt: now,
    };

    this.tasksById.set(task.id, task);

    return task;
  }

  update(userId: string, taskId: string, input: UpdateTaskInput) {
    const existing = this.tasksById.get(taskId);

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (existing.ownerId !== userId) {
      throw new ForbiddenException('Task does not belong to user');
    }

    const nextTask: TaskRecord = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description === undefined ? existing.description : (input.description ?? null),
      priority: input.priority ?? existing.priority,
      dueDate: input.dueDate === undefined ? existing.dueDate : (input.dueDate ? new Date(input.dueDate) : null),
      updatedAt: new Date(),
    };

    this.tasksById.set(taskId, nextTask);

    return nextTask;
  }

  remove(userId: string, taskId: string) {
    const existing = this.tasksById.get(taskId);

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (existing.ownerId !== userId) {
      throw new ForbiddenException('Task does not belong to user');
    }

    this.tasksById.delete(taskId);

    return { ok: true };
  }
}
