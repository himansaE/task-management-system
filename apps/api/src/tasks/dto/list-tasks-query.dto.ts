import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListTasksQueryDto {
  @ApiPropertyOptional({ enum: ['TODO', 'IN_PROGRESS', 'DONE'] })
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  limit?: number;
}
