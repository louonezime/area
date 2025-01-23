import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { registerDto, RegisterDto } from '../../user/dto/register-user.dto';
import { hashPassword } from '../utils';

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(user: any) {
    const payload = { id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: registerDto) {
    const { email, password, name } = registerDto;
    this.logger.debug(`Checking if email already exists: ${email}`);

    const userExists = await this.userService.getWithMail(email);
    if (userExists) {
      this.logger.warn(`Email is already in use: ${email}`);
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = hashPassword(password);
    const newUser = await this.userService.register({
      name,
      email,
      password: hashedPassword,
    });
    this.logger.log(`User registered successfully: ${newUser?.email}`);

    const payload = { id: newUser?.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
