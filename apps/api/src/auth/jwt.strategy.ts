import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_SECRET,
  JwtTokenPayload,
} from './auth.constants';
import { AuthRepository } from './auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authRepository: AuthRepository) {
    const extractAccessToken = (request?: Request): string | null => {
      if (!request) {
        return null;
      }

      const cookies = request.cookies as Record<string, unknown> | undefined;
      const token = cookies?.[ACCESS_TOKEN_COOKIE];

      return typeof token === 'string' ? token : null;
    };

    super({
      jwtFromRequest: extractAccessToken,
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtTokenPayload) {
    if (payload.typ !== 'access' || !payload.sid) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.authRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const session = await this.authRepository.findActiveSession(
      payload.sid,
      user.id,
    );

    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      sid: session.id,
    };
  }
}
