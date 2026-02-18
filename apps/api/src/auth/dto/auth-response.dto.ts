import { ApiProperty } from '@nestjs/swagger';
import { OkResponseDto } from '../../common/dto/ok-response.dto';
import { AuthUserResponseDto } from './auth-user-response.dto';

export class AuthUserEnvelopeResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  data!: AuthUserResponseDto;
}

export class AuthOkEnvelopeResponseDto {
  @ApiProperty({ type: OkResponseDto })
  data!: OkResponseDto;
}
