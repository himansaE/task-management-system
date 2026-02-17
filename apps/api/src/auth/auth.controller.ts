import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { loginSchema, registerSchema } from '@repo/contract';
import { CurrentUserId } from '../common/request-user.decorator';
import { parseWithZod } from '../common/zod-parse';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    const payload = parseWithZod(registerSchema, body);
    return this.authService.register(payload);
  }

  @Post('login')
  login(@Body() body: unknown) {
    const payload = parseWithZod(loginSchema, body);
    return this.authService.login(payload);
  }

  @Post('refresh')
  refresh(
    @CurrentUserId() userId: string,
    @Headers('x-refresh-token') refreshToken: string | undefined,
  ) {
    if (!refreshToken || refreshToken.trim().length === 0) {
      throw new UnauthorizedException('Missing x-refresh-token header');
    }

    return this.authService.refresh(userId, refreshToken);
  }
}
