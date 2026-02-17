import {
  UnauthorizedException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const rawUserId = request.headers['x-user-id'];

    if (
      !rawUserId ||
      Array.isArray(rawUserId) ||
      rawUserId.trim().length === 0
    ) {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    return rawUserId;
  },
);
