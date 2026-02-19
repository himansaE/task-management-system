import { ApiProperty } from '@nestjs/swagger';

export class ApiDataResponseDto<TData> {
  @ApiProperty()
  data!: TData;
}
