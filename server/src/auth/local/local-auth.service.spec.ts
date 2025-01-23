import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthService } from './local-auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('LocalAuthService', () => {
  let service: LocalAuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAuthService,
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

    service = module.get<LocalAuthService>(LocalAuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return a JWT token when login is successful', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

      const result = await service.login(mockUser);
      expect(result).toEqual({ access_token: 'jwt_token' });
    });
  });

  describe('register', () => {
    const mockUser = {
      name: 'test',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return a JWT token when login is successful', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

      const result = await service.register(mockUser);
      expect(result).toEqual({ access_token: 'jwt_token' });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
