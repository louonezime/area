import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceModule } from '../service/service.module';
import { AreaModule } from '../area/area.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ServiceModule,
    AreaModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
