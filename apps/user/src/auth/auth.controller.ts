import { Controller, UnauthorizedException } from '@nestjs/common';

import { UserMicroservice } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { AuthService } from './auth.service';
@Controller('auth')
@UserMicroservice.AuthServiceControllerMethods()
export class AuthController implements UserMicroservice.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // @UsePipes(ValidationPipe)
  // registerUser(
  //   @GetAuthorization() token: string,
  //   @Body() registerDto: RegisterDto,
  // ) {
  //   if (token === null) {
  //     throw new UnauthorizedException('토큰을 입력해주세요');
  //   }

  //   return this.authService.register(token, registerDto);
  // }

  // @Post('login')
  // @UsePipes(ValidationPipe)
  // loginUser(@GetAuthorization() token: string) {
  //   if (token === null) {
  //     throw new UnauthorizedException('토큰을 입력해주세요');
  //   }

  //   return this.authService.login(token);
  // }

  // @MessagePattern({
  //   cmd: 'register',
  // })
  async registerUser(request: UserMicroservice.RegisterUserRequest) {
    const { token } = request;
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    const user = await this.authService.register(token, request);
    console.log('user', user);
    if (!user) {
      throw new UnauthorizedException('정상적으로 유저가 등록되지 않았습니다');
    }
    return user;
  }

  // @MessagePattern({
  //   cmd: 'login',
  // })
  loginUser(request: UserMicroservice.LoginUserRequest, metadata: Metadata) {
    console.log(metadata);

    const { token } = request;
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요');
    }

    return this.authService.login(token);
  }

  // @MessagePattern(
  //   {
  //     cmd: 'parse_bearer_token',
  //   },
  //   // Transport.TCP,
  // )
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  parseBearerToken(request: UserMicroservice.ParseBearerTokenRequest) {
    return this.authService.parseBearerToken({
      token: request.token,
      isRefreshToken: false,
    });
  }
}
