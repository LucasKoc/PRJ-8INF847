import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account and receive a JWT' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for a JWT (identifier = email or username)' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated user' })
  me(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({
    summary: 'Password reset — not implemented in V1',
    description: 'Password reset via email link is planned for V2. No-op endpoint.',
  })
  forgotPassword() {
    return {
      statusCode: 501,
      feature: 'password_reset',
      message:
        'Password reset will be available in a future version. Please contact an administrator if you cannot access your account.',
    };
  }
}
