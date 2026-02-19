import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(request: Request): Promise<string> {
    const userId = this.extractUserId(request);
    const ipAddress = request.ip ?? request.socket?.remoteAddress ?? 'unknown';
    const routePath = request.route?.path ?? request.path ?? request.url;
    const method = request.method ?? 'UNKNOWN';

    return `${userId}:${ipAddress}:${method}:${routePath}`;
  }

  private extractUserId(request: Request): string {
    const authenticatedUser = (request as Request & { user?: { sub?: string } })
      .user?.sub;

    if (authenticatedUser && authenticatedUser.trim().length > 0) {
      return authenticatedUser;
    }

    return 'anon';
  }
}
