import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { UserService } from '../user/user.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { updateDto, updateSchema, UpdateUserDto } from './dto/update-user.dto';
import { ZodValidationPipe } from '../validation.pipe';

@UseGuards(JwtAuthGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user profile',
    schema: {
      example: {
        id: 1,
        name: 'Tim Burton',
        email: 'npc@gmail.com',
        oauthProvider: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @Get()
  async getProfile(@Request() req: any) {
    return this.userService.getWithID(req.user.userId);
  }

  @UsePipes(new ZodValidationPipe(updateSchema))
  @ApiOperation({ summary: 'Update profile information' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Tim B',
        email: 'npc@gmail.com',
        oauthProvider: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request with PATCH request content',
  })
  @ApiBody({ type: UpdateUserDto })
  @Patch('update')
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto, // to change to updateDto
  ) {
    const updatedUser = await this.userService.updateUser(
      req.user.userId,
      updateUserDto,
    );

    const { password: _, ...result } = updatedUser;
    return result;
  }
}
