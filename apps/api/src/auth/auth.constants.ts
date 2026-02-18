export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me';
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me';

export type JwtTokenPayload = {
  sub: string;
  v: number;
  typ: 'access' | 'refresh';
};
