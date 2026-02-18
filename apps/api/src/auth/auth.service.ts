import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginInput, RegisterInput } from '@repo/contract';
import * as argon2 from 'argon2';
import { AuthRepository, AuthUserRecord } from './auth.repository';
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_TTL_SECONDS,
  JwtTokenPayload,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await this.authRepository.findByEmail(normalizedEmail);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.authRepository.create({
      email: normalizedEmail,
      name: input.name.trim(),
      passwordHash: await this.hashPassword(input.password),
      tokenVersion: 1,
    });

    const tokens = await this.issueTokens(user.id, user.tokenVersion);

    return {
      user: this.publicUser(user),
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.authRepository.findByEmail(normalizedEmail);

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const nextTokenVersion = user.tokenVersion + 1;

    const persistedUser = await this.authRepository.updateTokenVersion(
      user.id,
      nextTokenVersion,
    );

    if (!persistedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(
      persistedUser.id,
      persistedUser.tokenVersion,
    );

    return {
      user: this.publicUser(persistedUser),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
        refreshToken,
        {
          secret: REFRESH_TOKEN_SECRET,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.authRepository.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.v) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const nextTokenVersion = user.tokenVersion + 1;

    const refreshedUser = await this.authRepository.updateTokenVersion(
      user.id,
      nextTokenVersion,
    );

    if (!refreshedUser) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(
      refreshedUser.id,
      refreshedUser.tokenVersion,
    );

    return {
      ...tokens,
    };
  }

  async revokeAll(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.authRepository.updateTokenVersion(
      user.id,
      user.tokenVersion + 1,
    );
  }

  private async hashPassword(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  private async issueTokens(userId: string, tokenVersion: number) {
    const accessPayload: JwtTokenPayload = {
      sub: userId,
      v: tokenVersion,
      typ: 'access',
    };

    const refreshPayload: JwtTokenPayload = {
      sub: userId,
      v: tokenVersion,
      typ: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: ACCESS_TOKEN_SECRET,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: REFRESH_TOKEN_SECRET,
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private publicUser(user: AuthUserRecord) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
