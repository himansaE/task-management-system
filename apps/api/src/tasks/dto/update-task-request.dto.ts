import { PartialType } from '@nestjs/swagger';
import { CreateTaskRequestDto } from './create-task-request.dto';

export class UpdateTaskRequestDto extends PartialType(CreateTaskRequestDto) {}
