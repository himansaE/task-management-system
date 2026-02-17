import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInput, RegisterInput } from '@repo/contract';
import { users } from '@repo/database';
import { createHash, randomUUID } from 'node:crypto';

type UserRecord = typeof users.$inferSelect;

type UserWithRefresh = UserRecord & {
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly usersById = new Map<string, UserWithRefresh>();
  private readonly userIdByEmail = new Map<string, string>();

  register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    if (this.userIdByEmail.has(normalizedEmail)) {
      throw new ConflictException('Email already registered');
    }

    const id = randomUUID();
    const now = new Date();
    const refreshToken = randomUUID();

    const user: UserWithRefresh = {
      id,
      email: normalizedEmail,
      name: input.name.trim(),
      passwordHash: this.hashPassword(input.password),
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
      refreshToken,
    };

    this.usersById.set(id, user);
    this.userIdByEmail.set(normalizedEmail, id);

    return {
      user: this.publicUser(user),
      accessToken: this.makeAccessToken(user.id),
      refreshToken,
    };
  }

  login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const userId = this.userIdByEmail.get(normalizedEmail);

    if (!userId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.usersById.get(userId);

    if (!user || user.passwordHash !== this.hashPassword(input.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.updatedAt = new Date();
    user.refreshToken = randomUUID();

    return {
      user: this.publicUser(user),
      accessToken: this.makeAccessToken(user.id),
      refreshToken: user.refreshToken,
    };
  }

  refresh(userId: string, refreshToken: string) {
    const user = this.usersById.get(userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    user.updatedAt = new Date();

    return {
      accessToken: this.makeAccessToken(user.id),
      refreshToken: user.refreshToken,
    };
  }

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  private makeAccessToken(userId: string) {
    return `dev-token-${userId}`;
  }

  private publicUser(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
