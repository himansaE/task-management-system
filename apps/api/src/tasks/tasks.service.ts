import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskInput, UpdateTaskInput } from '@repo/contract';
import { TaskRecord, TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async list(userId: string) {
    return this.tasksRepository.listByOwnerId(userId);
  }

  async create(userId: string, input: CreateTaskInput) {
    return this.tasksRepository.create({
      ownerId: userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });
  }

  async update(userId: string, taskId: string, input: UpdateTaskInput) {
    const existing = await this.tasksRepository.findById(taskId);

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (existing.ownerId !== userId) {
      throw new ForbiddenException('Task does not belong to user');
    }

    const updated = await this.tasksRepository.updateById(taskId, {
      title: input.title ?? existing.title,
      description:
        input.description === undefined
          ? existing.description
          : (input.description ?? null),
      priority: input.priority ?? existing.priority,
      dueDate:
        input.dueDate === undefined
          ? existing.dueDate
          : input.dueDate
            ? new Date(input.dueDate)
            : null,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Task not found');
    }

    return updated as TaskRecord;
  }

  async remove(userId: string, taskId: string) {
    const existing = await this.tasksRepository.findById(taskId);

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (existing.ownerId !== userId) {
      throw new ForbiddenException('Task does not belong to user');
    }

    await this.tasksRepository.deleteById(taskId);

    return { ok: true };
  }
}
