import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { registerDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../auth/utils';
import { User } from '@prisma/client';
import { UserInfo } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getWithID(id: number): Promise<UserInfo> {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      oauthProvider: user?.oauthProvider,
    };
  }

  async getWithMail(email: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { email: email, oauthProvider: null },
    });
  }

  async getWithMailAndProvider(
    email: string,
    provider: string,
  ): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { email: email, oauthProvider: provider },
    });
  }

  async register(registerDto: registerDto): Promise<User | null> {
    const { email, password, name } = registerDto;
    this.logger.debug(`Registering [${email}]...`);

    return this.prisma.user.create({
      data: {
        name,
        email,
        password,
        oauthProvider: null,
      },
    });
  }

  async registerViaOAuth(
    provider: string,
    email: string,
    name: string,
  ): Promise<User | null> {
    this.logger.debug(`Registering [${email}] via OAuth2...`);

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: null,
        oauthProvider: provider,
      },
    });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.getWithMail(email);
    if (!user || !user.password) {
      return null;
    }

    if (hashPassword(password) === user.password) {
      const { password: _, ...result } = user;
      return result;
    }

    this.logger.warn(`Password mismatch for user: ${email}`);
    return null;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found in database');
    }

    const userUpdated = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    const { password: _, ...result } = userUpdated;
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      oauthProvider: result.oauthProvider,
    };
  }
}
