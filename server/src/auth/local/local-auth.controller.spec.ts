import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthController } from './local-auth.controller';
import { LocalAuthService } from './local-auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../../user/user.module';

describe('LocalAuthController', () => {
  let controller: LocalAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
      controllers: [LocalAuthController],
      providers: [LocalAuthService, JwtService],
    }).compile();

    controller = module.get<LocalAuthController>(LocalAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
