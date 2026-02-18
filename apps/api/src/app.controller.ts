import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { users } from '@repo/database';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @ApiOperation({ summary: 'Hello endpoint' })
  @ApiOkResponse({ schema: { type: 'string', example: 'Hello World!' } })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Database health check' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  @ApiServiceUnavailableResponse({ description: 'Database unavailable' })
  @Get('health/db')
  async getDatabaseHealth() {
    try {
      await this.databaseService.db
        .select({ id: users.id })
        .from(users)
        .limit(1);

      return {
        status: 'ok',
      };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
