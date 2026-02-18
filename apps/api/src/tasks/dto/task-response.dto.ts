import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from './task.dto';

export class TasksListMetaDto {
  @ApiProperty({ minimum: 1, example: 1 })
  page!: number;

  @ApiProperty({ minimum: 1, maximum: 100, example: 10 })
  limit!: number;

  @ApiProperty({ minimum: 0, example: 42 })
  total!: number;
}

export class TaskResponseDto {
  @ApiProperty({ type: TaskDto })
  data!: TaskDto;
}

export class TaskListResponseDto {
  @ApiProperty({ type: TaskDto, isArray: true })
  data!: TaskDto[];

  @ApiProperty({ type: TasksListMetaDto })
  meta!: TasksListMetaDto;
}
