import { PRODUCT_SERVICE, USER_SERVICE } from '@app/common';
import { RpcResponse } from '@app/common/types/response.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'apps/product/src/product/entity/product.entity';
import { User } from 'apps/user/src/user/entity/user.entity';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { AddressDto } from './dto/address.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Customer } from './entity/customer.entity';
import { Order } from './entity/order.entity';
import { Product as OrderProduct } from './entity/product.entity';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}
  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    const { productIds, address, payment } = createOrderDto;
    // 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(token);

    // 2) 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds);

    // 3) 총 금액 계산
    const totalAmount = this.calculateTotalAmount(products);

    // 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터와 값이 같은지 검증)
    this.validatePaymentAmount(payment.amount, totalAmount);

    // 5) 주문 생성
    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(
      customer,
      products,
      address,
      payment,
    );

    // 6) 결제 시도
    // 7) 주문 상태 업데이트
    // 8) 결과 반환
  }

  private async getUserFromToken(token: string): Promise<User> {
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

  private async getProductsByIds(
    productIds: string[],
  ): Promise<OrderProduct[]> {
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

  private calculateTotalAmount(products: OrderProduct[]) {
    return products.reduce((acc, cur) => acc + cur.price, 0);
  }

  private validatePaymentAmount(clientAmount: number, serverAmount: number) {
    if (clientAmount !== serverAmount) {
      throw new PaymentCancelledException('결제하려는 금액이 변경되었습니다.');
    }
  }

  private createCustomer(user: User): Customer {
    const { id, email, name } = user;
    return {
      userId: id,
      email,
      name,
    };
  }
  private async createNewOrder(
    customer: Customer,
    products: OrderProduct[],
    deliveryAddress: AddressDto,
    payment: PaymentDto,
  ) {
    return this.orderModel.create({
      customer,
      products,
      deliveryAddress,
      payment,
    });
  }
}
