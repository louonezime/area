import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  UnauthorizedException,
  Logger,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('OAuth2')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @ApiOperation({ summary: 'Get redirect URL to init connexion with Google' })
  @ApiParam({
    name: 'provider',
    type: 'string',
    description: 'Name of the OAuth2 provider',
    required: true,
  })
  @ApiParam({
    name: 'redirect',
    type: 'string',
    description: 'Redirect URI for the OAuth2 provider (optional)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved google oauth2 url',
    schema: {
      example: {
        redirectUrl:
          'https://accounts.google.com/o/oauth2/v2/auth?client_id=...',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get(':provider/init')
  async oauthInit(
    @Param('provider') provider: string,
    @Query('redirect') newRedirect: string,
  ) {
    return {
      redirectUrl: this.oauthService.getAuthUrl(provider, newRedirect),
    };
  }

  @ApiOperation({
    summary: 'Callback to register/login a user connexion with Google',
  })
  @ApiParam({
    name: 'provider',
    type: 'string',
    description: 'Name of the OAuth2 provider',
    required: true,
  })
  @ApiParam({
    name: 'redirect',
    type: 'string',
    description:
      'Redirect URI for the OAuth2 provider (optional, required if inital request had redirect)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved provider's authentication token",
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: `Callback doesn't contain a code`,
  })
  @ApiResponse({
    status: 401,
    description: 'Failed to connect, provider callback is invalid',
  })
  @Get(':provider/callback')
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string | null,
    @Query('redirect') newRedirect: string | undefined,
    @Query('error') error: string | null,
  ) {
    if (!code) throw new BadRequestException("Callback doesn't contain a code");
    if (error)
      throw new UnauthorizedException(
        'Failed to connect, provider callback invalid',
      );
    try {
      return this.oauthService.callbackProvider(provider, code, newRedirect);
    } catch {
      throw new UnauthorizedException(
        "Failed to connect, couldn't access user info",
      );
    }
  }

  @ApiOperation({ summary: 'Stand by path for mobile client' })
  @ApiParam({
    name: 'provider',
    type: 'string',
    description: 'Name of the OAuth2 provider',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        standBy: true,
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get(':provider/mobile-stand-by')
  async oauthMobileStandBy(@Param('provider') provider: string) {
    Logger.log(`GET \'stand by\' for ${provider}.`);
    return {
      standBy: true,
    };
  }
}
