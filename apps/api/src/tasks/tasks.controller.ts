import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from '@repo/contract';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { CurrentUserId } from '../common/request-user.decorator';
import { OkResponseDto } from '../common/dto/ok-response.dto';
import { parseWithZod } from '../common/zod-parse';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { TaskListResponseDto, TaskResponseDto } from './dto/task-response.dto';
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
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: TaskListResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
    type: ApiErrorResponseDto,
  })
  @Get()
  async list(
    @CurrentUserId() userId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    const payload = parseWithZod(listTasksQuerySchema, query);
    return this.tasksService.list(userId, payload);
  }

  @ApiOperation({ summary: 'Create a task' })
  @ApiBody({ type: CreateTaskRequestDto })
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
    type: ApiErrorResponseDto,
  })
  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: unknown) {
    const payload = parseWithZod(createTaskSchema, body);
    const task = await this.tasksService.create(userId, payload);
    return { data: task };
  }

  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID', format: 'uuid' })
  @ApiBody({ type: UpdateTaskRequestDto })
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Task not found',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
    type: ApiErrorResponseDto,
  })
  @Put(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') taskId: string,
    @Body() body: unknown,
  ) {
    const payload = parseWithZod(updateTaskSchema, body);
    const task = await this.tasksService.update(userId, taskId, payload);
    return { data: task };
  }

  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', format: 'uuid' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Task not found',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
    type: ApiErrorResponseDto,
  })
  @Delete(':id')
  async remove(@CurrentUserId() userId: string, @Param('id') taskId: string) {
    const result = await this.tasksService.remove(userId, taskId);
    return { data: result as OkResponseDto };
  }
}
