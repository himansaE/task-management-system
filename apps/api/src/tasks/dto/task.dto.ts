import { ApiProperty } from '@nestjs/swagger';

export class TaskDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  ownerId!: string;

  @ApiProperty({ example: 'Prepare assessment submission' })
  title!: string;

  @ApiProperty({ nullable: true, example: 'Finalize API and docs' })
  description!: string | null;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM' })
  priority!: 'LOW' | 'MEDIUM' | 'HIGH';

  @ApiProperty({ enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'TODO' })
  status!: 'TODO' | 'IN_PROGRESS' | 'DONE';

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  dueDate!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
