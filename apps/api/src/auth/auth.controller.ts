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
import { OkResponseDto } from '../common/dto/ok-response.dto';
import { CurrentUserId } from '../common/request-user.decorator';
import { parseWithZod } from '../common/zod-parse';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Throttle({ default: { limit: 5, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private applyAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = process.env.NODE_ENV === 'production';

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    response.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = parseWithZod(registerSchema, body);
    const result = await this.authService.register(payload);
    this.applyAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      user: result.user,
    };
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = parseWithZod(loginSchema, body);
    const result = await this.authService.login(payload);
    this.applyAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      user: result.user,
    };
  }

  @ApiOperation({ summary: 'Refresh auth session using refresh cookie' })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid refresh token' })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
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

    return { ok: true };
  }

  @ApiOperation({ summary: 'Logout current session' })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    this.clearAuthCookies(response);
    return { ok: true };
  }

  @ApiOperation({ summary: 'Revoke all user sessions' })
  @ApiCookieAuth('accessToken')
  @ApiOkResponse({ type: OkResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
  @Post('revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revoke(
    @CurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.revokeAll(userId);
    this.clearAuthCookies(response);
    return { ok: true };
  }
}
