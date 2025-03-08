import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userService: ClientProxy,
  ) {}
  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    // 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(token);
    // 2) 상품 정보 가져오기
    // 3) 총 금액 계산
    // 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터와 값이 같은지 검증)
    // 5) 주문 생성
    // 6) 결제 시도
    // 7) 주문 상태 업데이트
    // 8) 결과 반환
  }

  async getUserFromToken(token: string) {
    // 1) User MS: JWT token 검증
    const response = await lastValueFrom(
      this.userService.send(
        {
          cmd: 'parse_bearer_token',
        },
        { token },
      ),
    );
    // 2) User MS: 사용자 정보 가져오기
  }
}
