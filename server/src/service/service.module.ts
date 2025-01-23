import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, JwtAuthGuard, PrismaService],
})
export class ServiceModule {}
