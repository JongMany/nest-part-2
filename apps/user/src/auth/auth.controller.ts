import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { GetAuthorization } from './decorator/get-authorization.decorator';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';
import { RegisterDto } from './dto/register-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  registerUser(
    @GetAuthorization() token: string,
    @Body() registerDto: RegisterDto,
  ) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.register(token, registerDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  loginUser(@GetAuthorization() token: string) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.login(token);
  }

  @MessagePattern(
    {
      cmd: 'parse_bearer_token',
    },
    Transport.TCP,
  )
  @UsePipes(ValidationPipe)
  parseBearerToken(@Payload() payload: ParseBearerTokenDto) {
    console.log('Request Received', payload);
    return this.authService.parseBearerToken({
      token: payload.token,
      isRefreshToken: false,
    });
  }
}
