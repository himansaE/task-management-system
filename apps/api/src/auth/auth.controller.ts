import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '@repo/contract';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { OkResponseDto } from '../common/dto/ok-response.dto';
import {
  CurrentSessionId,
  CurrentUserId,
} from '../common/request-user.decorator';
import { parseWithZod } from '../common/zod-parse';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import {
  AuthOkEnvelopeResponseDto,
  AuthUserEnvelopeResponseDto,
} from './dto/auth-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Throttle({ default: { limit: 5, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookiePolicy() {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;

    return {
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      domain:
        cookieDomain && cookieDomain.trim().length > 0
          ? cookieDomain
          : undefined,
    };
  }

  private applyAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const cookiePolicy = this.getCookiePolicy();

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: cookiePolicy.secure,
      sameSite: cookiePolicy.sameSite,
      domain: cookiePolicy.domain,
      path: '/',
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: cookiePolicy.secure,
      sameSite: cookiePolicy.sameSite,
      domain: cookiePolicy.domain,
      path: '/',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
  }

  private clearAuthCookies(response: Response) {
    const cookiePolicy = this.getCookiePolicy();

    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      path: '/',
      sameSite: cookiePolicy.sameSite,
      secure: cookiePolicy.secure,
      domain: cookiePolicy.domain,
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      path: '/',
      sameSite: cookiePolicy.sameSite,
      secure: cookiePolicy.secure,
      domain: cookiePolicy.domain,
    });
  }

  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid payload',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many attempts',
    type: ApiErrorResponseDto,
  })
  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = parseWithZod(registerSchema, body);
    const result = await this.authService.register(payload);
    this.applyAuthCookies(response, result.accessToken, result.refreshToken);

    return { data: { user: result.user } };
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many attempts',
    type: ApiErrorResponseDto,
  })
  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = parseWithZod(loginSchema, body);
    const result = await this.authService.login(payload);
    this.applyAuthCookies(response, result.accessToken, result.refreshToken);

    return { data: { user: result.user } };
  }

  @ApiOperation({ summary: 'Refresh auth session using refresh cookie' })
  @ApiOkResponse({ type: AuthOkEnvelopeResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid refresh token',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many attempts',
    type: ApiErrorResponseDto,
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;

    if (!refreshToken || refreshToken.trim().length === 0) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.refresh(refreshToken);
    this.applyAuthCookies(response, result.accessToken, result.refreshToken);

    return { data: { user: result.user } };
  }

  @ApiOperation({ summary: 'Logout current session' })
  @ApiCookieAuth('accessToken')
  @ApiOkResponse({ type: AuthOkEnvelopeResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many attempts',
    type: ApiErrorResponseDto,
  })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUserId() userId: string,
    @CurrentSessionId() sessionId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logoutSession(userId, sessionId);
    this.clearAuthCookies(response);
    return { data: { ok: true } as OkResponseDto };
  }

  @ApiOperation({ summary: 'Revoke all user sessions' })
  @ApiCookieAuth('accessToken')
  @ApiOkResponse({ type: AuthOkEnvelopeResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ApiErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many attempts',
    type: ApiErrorResponseDto,
  })
  @Post('revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revoke(
    @CurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.revokeAll(userId);
    this.clearAuthCookies(response);
    return { data: { ok: true } as OkResponseDto };
  }
}
