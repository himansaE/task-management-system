import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ minLength: 2, maxLength: 80, example: 'Jane Doe' })
  name!: string;

  @ApiProperty({ minLength: 8, maxLength: 72, example: 'StrongPass123!' })
  password!: string;
}
