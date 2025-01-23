import { Test, TestingModule } from '@nestjs/testing';
import { OAuthService } from './oauth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('OAuthService', () => {
  let service: OAuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: UserService,
          useValue: {
            getWithMail: jest.fn(),
            validateUser: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
