import {
  UnauthorizedException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: { sub?: string } }>();
    const userId = request.user?.sub;

    if (!userId || userId.trim().length === 0) {
      throw new UnauthorizedException('Missing authenticated user context');
    }

    return userId;
  },
);
