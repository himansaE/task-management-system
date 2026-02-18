import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInput, RegisterInput } from '@repo/contract';
import { createHash } from 'node:crypto';
import { AuthRepository, AuthUserRecord } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await this.authRepository.findByEmail(normalizedEmail);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.authRepository.create({
      email: normalizedEmail,
      name: input.name.trim(),
      passwordHash: this.hashPassword(input.password),
      tokenVersion: 1,
    });

    return {
      user: this.publicUser(user),
      accessToken: this.makeAccessToken(user.id, user.tokenVersion),
      refreshToken: this.makeRefreshToken(user.id, user.tokenVersion),
    };
  }

  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.authRepository.findByEmail(normalizedEmail);

    if (!user || user.passwordHash !== this.hashPassword(input.password)) {
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

    return {
      user: this.publicUser(persistedUser),
      accessToken: this.makeAccessToken(
        persistedUser.id,
        persistedUser.tokenVersion,
      ),
      refreshToken: this.makeRefreshToken(
        persistedUser.id,
        persistedUser.tokenVersion,
      ),
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const expectedRefreshToken = this.makeRefreshToken(
      user.id,
      user.tokenVersion,
    );

    if (refreshToken !== expectedRefreshToken) {
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

    return {
      accessToken: this.makeAccessToken(
        refreshedUser.id,
        refreshedUser.tokenVersion,
      ),
      refreshToken: this.makeRefreshToken(
        refreshedUser.id,
        refreshedUser.tokenVersion,
      ),
    };
  }

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  private makeAccessToken(userId: string, tokenVersion: number) {
    return `dev-token-${userId}-${tokenVersion}`;
  }

  private makeRefreshToken(userId: string, tokenVersion: number) {
    return `dev-refresh-${userId}-${tokenVersion}`;
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
