import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { createDatabaseClient, DatabaseClient } from '@repo/database';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly db: DatabaseClient;

  private readonly pool: ReturnType<typeof createDatabaseClient>['pool'];

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for API database access');
    }

    const client = createDatabaseClient(databaseUrl);
    this.db = client.db;
    this.pool = client.pool;
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
