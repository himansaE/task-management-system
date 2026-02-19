export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function requireEnv(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const ACCESS_TOKEN_SECRET = requireEnv('JWT_ACCESS_SECRET');
export const REFRESH_TOKEN_SECRET = requireEnv('JWT_REFRESH_SECRET');

export type JwtTokenPayload = {
  sub: string;
  sid: string;
  typ: 'access' | 'refresh';
};
