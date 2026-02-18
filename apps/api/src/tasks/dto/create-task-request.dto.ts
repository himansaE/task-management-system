import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskRequestDto {
  @ApiProperty({ minLength: 1, maxLength: 160, example: 'Prepare assessment' })
  title!: string;

  @ApiProperty({
    required: false,
    maxLength: 2000,
    example: 'Finalize and submit by evening',
  })
  description?: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' })
  priority!: 'LOW' | 'MEDIUM' | 'HIGH';

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  dueDate?: string;
}
