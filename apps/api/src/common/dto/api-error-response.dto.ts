import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Invalid refresh token' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['title must be at least 1 character'],
      },
    ],
  })
  message!: string | string[];

  @ApiProperty({ example: '2026-02-18T10:00:00.000Z' })
  timestamp!: string;
}
