import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
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
    });

    const tokens = await this.createSessionAndIssueTokens(user.id);

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

    const tokens = await this.createSessionAndIssueTokens(user.id);

    return {
      user: this.publicUser(user),
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

    if (payload.typ !== 'refresh' || !payload.sid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.authRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.authRepository.findActiveSession(
      payload.sid,
      user.id,
    );

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!this.compareTokenHash(refreshToken, session.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user.id, session.id);

    const rotatedSession = await this.authRepository.rotateSession(
      session.id,
      this.hashToken(tokens.refreshToken),
      this.refreshExpiryDate(),
    );

    if (!rotatedSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      user: this.publicUser(user),
      ...tokens,
    };
  }

  async logoutSession(userId: string, sessionId: string) {
    await this.authRepository.revokeSession(sessionId, userId);
  }

  async revokeAll(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.authRepository.revokeAllSessions(user.id);
  }

  private async hashPassword(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  private async createSessionAndIssueTokens(userId: string) {
    const sessionId = randomUUID();
    const tokens = await this.issueTokens(userId, sessionId);

    const session = await this.authRepository.createSession({
      id: sessionId,
      userId,
      refreshTokenHash: this.hashToken(tokens.refreshToken),
      expiresAt: this.refreshExpiryDate(),
    });

    if (!session) {
      throw new UnauthorizedException('Unable to create auth session');
    }

    return tokens;
  }

  private async issueTokens(userId: string, sessionId: string) {
    const accessPayload: JwtTokenPayload = {
      sub: userId,
      sid: sessionId,
      typ: 'access',
    };

    const refreshPayload: JwtTokenPayload = {
      sub: userId,
      sid: sessionId,
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

  private refreshExpiryDate() {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private compareTokenHash(token: string, hash: string) {
    const tokenHash = this.hashToken(token);

    if (tokenHash.length !== hash.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
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
