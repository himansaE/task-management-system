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
    super({
      jwtFromRequest: (request: Request) =>
        request?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null,
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtTokenPayload) {
    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.authRepository.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.v) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
