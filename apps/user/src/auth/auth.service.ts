import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);
    const user = await this.authenticate(email, password);

    return {
      refreshToken: await this.issueToken({
        user,
        isRefreshToken: true,
      }),
      accessToken: await this.issueToken({
        user,
        isRefreshToken: false,
      }),
    };
  }
  private async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    // validate email
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  private async issueToken(options: { user: User; isRefreshToken: boolean }) {
    const { user, isRefreshToken } = options;
    const refreshTokenSecret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );
    const accessTokenSecret = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_SECRET',
    );

    return this.jwtService.signAsync(
      {
        // sub: user.id ?? user.sub,
        // role: user.role,
        sub: user.id,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: '3600h',
      },
    );
  }

  async register(rawToken: string, registerDto: RegisterDto) {
    const { email, password } = this.parseBasicToken(rawToken);

    return this.userService.create({
      ...registerDto,
      email,
      password,
    });
  }

  private parseBasicToken(rawToken: string) {
    // Bearer $Token
    const basicTokenSplit = rawToken.split(' ');

    if (basicTokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [basic, token] = basicTokenSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // username:password
    const tokenSplit = decoded.split(':');
    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }
    const [email, password] = tokenSplit;

    return {
      email,
      password,
    };
  }

  async parseBearerToken(options: { token: string; isRefreshToken: boolean }) {
    const { token: rawToken, isRefreshToken } = options;
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = basicSplit;
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    try {
      const tokenSecret = this.configService.getOrThrow<string>(
        isRefreshToken ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET',
      );
      const payload = await this.jwtService.verifyAsync(token, {
        secret: tokenSecret,
      });
      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('Refresh Token을 입력해주세요');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('Access Token을 입력해주세요');
        }
      }
      return payload;
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }
}
