import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const envCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
