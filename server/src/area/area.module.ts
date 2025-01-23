import { Module } from '@nestjs/common';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceService } from '../service/service.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RefreshService } from './refresh.service';
import { WebhookController } from './webhook.controller';

@Module({
  controllers: [AreaController, WebhookController],
  providers: [
    AreaService,
    JwtAuthGuard,
    PrismaService,
    ServiceService,
    RefreshService,
  ],
  imports: [ScheduleModule.forRoot()],
})
export class AreaModule {}
