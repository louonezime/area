import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService, JwtAuthGuard, PrismaService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
