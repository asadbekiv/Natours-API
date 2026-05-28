import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

// Shares the /users prefix with UsersController. AuthModule is imported before
// UsersModule in AppModule so these routes register before the ':id' route.
@ApiTags('auth')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto, @Req() req: Request) {
    const welcomeUrl = `${req.protocol}://${req.get('host')}/me`;
    return this.authService.signup(dto, welcomeUrl);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Exchange a refresh token for a new access + refresh token pair.
  // No JwtAuthGuard — the access token is expected to be expired here.
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // Revokes the presented refresh token. Requires a valid access token so we
  // know it's the user themselves (access token is unaffected and will
  // naturally expire).
  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('forgotPassword')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const resetUrlBase = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword`;
    return this.authService.forgotPassword(dto.email, resetUrlBase);
  }

  @Patch('resetPassword/:token')
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto);
  }

  @Patch('updateMyPassword')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(user.id, dto);
  }
}
