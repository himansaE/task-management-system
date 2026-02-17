import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { createTaskSchema, updateTaskSchema } from '@repo/contract';
import { CurrentUserId } from '../common/request-user.decorator';
import { parseWithZod } from '../common/zod-parse';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.tasksService.list(userId);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Body() body: unknown) {
    const payload = parseWithZod(createTaskSchema, body);
    return this.tasksService.create(userId, payload);
  }

  @Put(':id')
  update(@CurrentUserId() userId: string, @Param('id') taskId: string, @Body() body: unknown) {
    const payload = parseWithZod(updateTaskSchema, body);
    return this.tasksService.update(userId, taskId, payload);
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: string, @Param('id') taskId: string) {
    return this.tasksService.remove(userId, taskId);
  }
}
