import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { createTaskSchema, updateTaskSchema } from '@repo/contract';
import { CurrentUserId } from '../common/request-user.decorator';
import { OkResponseDto } from '../common/dto/ok-response.dto';
import { parseWithZod } from '../common/zod-parse';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { TaskDto } from './dto/task.dto';
import { UpdateTaskRequestDto } from './dto/update-task-request.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiCookieAuth('accessToken')
@Throttle({ default: { limit: 100, ttl: 60_000 } })
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'List authenticated user tasks' })
  @ApiOkResponse({ type: TaskDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @Get()
  list(@CurrentUserId() userId: string) {
    return this.tasksService.list(userId);
  }

  @ApiOperation({ summary: 'Create a task' })
  @ApiBody({ type: CreateTaskRequestDto })
  @ApiOkResponse({ type: TaskDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @Post()
  create(@CurrentUserId() userId: string, @Body() body: unknown) {
    const payload = parseWithZod(createTaskSchema, body);
    return this.tasksService.create(userId, payload);
  }

  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID', format: 'uuid' })
  @ApiBody({ type: UpdateTaskRequestDto })
  @ApiOkResponse({ type: TaskDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @Put(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id') taskId: string,
    @Body() body: unknown,
  ) {
    const payload = parseWithZod(updateTaskSchema, body);
    return this.tasksService.update(userId, taskId, payload);
  }

  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', format: 'uuid' })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @Delete(':id')
  remove(@CurrentUserId() userId: string, @Param('id') taskId: string) {
    return this.tasksService.remove(userId, taskId);
  }
}
