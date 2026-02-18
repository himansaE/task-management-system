import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { users } from '@repo/database';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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
