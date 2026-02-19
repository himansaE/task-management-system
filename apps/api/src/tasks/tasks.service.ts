import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateTaskInput,
  ListTasksQueryInput,
  UpdateTaskInput,
} from '@repo/contract';
import { TaskRecord, TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async list(userId: string, query: ListTasksQueryInput) {
    const result = await this.tasksRepository.listByOwnerId(userId, query);

    return {
      data: result.items,
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
      },
    };
  }

  async create(userId: string, input: CreateTaskInput) {
    return this.tasksRepository.create({
      ownerId: userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });
  }

  async update(userId: string, taskId: string, input: UpdateTaskInput) {
    const updated = await this.tasksRepository.updateByIdForOwner(
      userId,
      taskId,
      {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description ?? null }
          : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.dueDate !== undefined
          ? {
              dueDate: input.dueDate ? new Date(input.dueDate) : null,
            }
          : {}),
        updatedAt: new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundException('Task not found');
    }

    return updated as TaskRecord;
  }

  async remove(userId: string, taskId: string) {
    const deleted = await this.tasksRepository.deleteByIdForOwner(
      userId,
      taskId,
    );

    if (!deleted) {
      throw new NotFoundException('Task not found');
    }

    return { ok: true };
  }
}
