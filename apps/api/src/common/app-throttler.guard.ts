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

    const accessToken = request.cookies?.access_token as string | undefined;

    if (!accessToken) {
      return 'anon';
    }

    const payloadSegment = accessToken.split('.')[1];

    if (!payloadSegment) {
      return 'anon';
    }

    try {
      const parsedPayload = JSON.parse(
        Buffer.from(payloadSegment, 'base64url').toString('utf8'),
      ) as { sub?: string };

      if (parsedPayload.sub && parsedPayload.sub.trim().length > 0) {
        return parsedPayload.sub;
      }
    } catch {
      return 'anon';
    }

    return 'anon';
  }
}
