import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { oauth2 } from './oauth.config';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async loginViaOAuth(user: User) {
    const payload = { id: user?.id };
    this.logger.debug(`Logged in via OAuth: ${user?.email}`);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerViaOAuth(provider: string, email: string, name: string) {
    const userExists = await this.userService.getWithMailAndProvider(
      email,
      provider,
    );
    if (userExists) {
      return this.loginViaOAuth({
        id: userExists.id,
        name: userExists.name,
        email: userExists.email,
        password: userExists.password,
      });
    }

    const user = await this.userService.registerViaOAuth(provider, email, name);
    const payload = { id: user?.id };
    this.logger.debug(`Registered via OAuth: ${user?.email}`);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getAuthUrl(provider: string, newRedirect: string | undefined): string {
    const config = oauth2.find((conf) => conf.name === provider);
    if (!config)
      throw new BadRequestException(`Provider ${provider} not implemented`);

    return config.utils.generateAuthUrl(newRedirect);
  }

  async callbackProvider(
    provider: string,
    auth_code: string,
    newRedirect: string | undefined,
  ) {
    const config = oauth2.find((conf) => conf.name === provider);
    if (!config)
      throw new BadRequestException(`Provider ${provider} not implemented`);

    const { token, expiration } = await config.utils.getToken(
      auth_code,
      newRedirect,
    );
    if (!token)
      throw new UnauthorizedException(
        `Couldn\'t fetch authenticate through ${provider}`,
      );
    this.logger.debug(`Token successfully retrieved ${token}`);
    this.logger.debug(`Expires in ${expiration}`);

    const result = await config.utils.getProfile(token);
    if (!result)
      throw new InternalServerErrorException(
        "Couldn't fetch the valid user profile infos to sign in",
      );
    const { name, email } = result;
    this.logger.debug(`Email + name (${name}: ${email}) successfully retrived`);

    return this.registerViaOAuth(provider, email, name);
  }
}
