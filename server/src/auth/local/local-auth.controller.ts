import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LocalAuthService } from './local-auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { registerDto, RegisterDto } from '../../user/dto/register-user.dto';
import { loginDto, LoginUserDto } from '../../user/dto/login-user.dto';
import { ZodValidationPipe } from '../../validation.pipe';
import { registerSchema } from '../../user/dto/register-user.dto';
import { loginSchema } from '../../user/dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class LocalAuthController {
  constructor(private authService: LocalAuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and logged in',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Request isn't valid, i.e. invalid properties",
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() registerDto: registerDto) {
    return await this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Request isn't valid, i.e. invalid properties",
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: loginDto, @Request() req: any) {
    return this.authService.login(req.user);
  }
}
