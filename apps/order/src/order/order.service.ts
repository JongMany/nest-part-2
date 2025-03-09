import { PRODUCT_SERVICE, USER_SERVICE } from '@app/common';
import { RpcResponse } from '@app/common/types/response.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Product } from 'apps/product/src/product/entity/product.entity';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}
  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    const { productIds, address, payment } = createOrderDto;
    // 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(token);

    // 2) 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds);
    // 3) 총 금액 계산
    // 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터와 값이 같은지 검증)
    // 5) 주문 생성
    // 6) 결제 시도
    // 7) 주문 상태 업데이트
    // 8) 결과 반환
  }

  async getUserFromToken(token: string) {
    // 1) User MS: JWT token 검증
    const tokenResponse = await lastValueFrom(
      this.userService.send(
        {
          cmd: 'parse_bearer_token',
        },
        { token },
      ),
    );
    if (tokenResponse.status === 'error') {
      throw new PaymentCancelledException(tokenResponse);
    }

    // 2) User MS: 사용자 정보 가져오기
    const userId = tokenResponse.data.sub;
    const userResponse = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { userId }),
    );
    if (userResponse.status === 'error') {
      throw new PaymentCancelledException(userResponse);
    }

    return userResponse.data;
  }

  async getProductsByIds(productIds: string[]) {
    const productResponse = await lastValueFrom(
      this.productService.send<RpcResponse<Product[]>>(
        {
          cmd: 'get_products_info',
        },
        {
          productIds,
        },
      ),
    );

    if (productResponse.status == 'error') {
      throw new PaymentCancelledException(productResponse);
    }

    // Product Entity로 변환
    return productResponse.data.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
    }));
  }
}
