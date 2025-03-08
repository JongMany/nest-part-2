import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const round = 10;
    const hashedPassword = await bcrypt.hash(password, round);

    await this.userRepository.save({
      ...createUserDto,
      email,
      password: hashedPassword,
    });

    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
}
