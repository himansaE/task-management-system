import { BadRequestException } from '@nestjs/common';

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { flatten: () => unknown } };

type SchemaLike<T> = {
  safeParse: (payload: unknown) => ParseResult<T>;
};

export function parseWithZod<T>(schema: SchemaLike<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new BadRequestException(parsed.error.flatten());
  }

  return parsed.data;
}
