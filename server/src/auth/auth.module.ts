import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthService } from './local/local-auth.service';
import { LocalAuthController } from './local/local-auth.controller';
import { LocalStrategy } from './local/local.strategy';
import { JwtStrategy } from './common/jwt.strategy';
import { UserModule } from '../user/user.module';
import { jwtConstants } from './common/constants';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { OAuthService } from './oauth/oauth.service';
import { OAuthController } from './oauth/oauth.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  providers: [
    LocalAuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    OAuthService,
    PrismaService,
  ],
  controllers: [LocalAuthController, OAuthController],
  exports: [LocalAuthService, JwtAuthGuard],
})
export class AuthModule {}
