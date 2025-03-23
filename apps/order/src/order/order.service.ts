import {
  constructMetadata,
  PAYMENT_SERVICE,
  PaymentMicroservice,
  PRODUCT_SERVICE,
  ProductMicroservice,
  USER_SERVICE,
  UserMicroservice,
} from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { AddressDto } from './dto/address.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Customer } from './entity/customer.entity';
import { Order, OrderStatus } from './entity/order.entity';
import { PaymentStatus } from './entity/payment.entity';
import { Product as OrderProduct } from './entity/product.entity';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { PaymentFailedException } from './exception/payment-failed.exception';

@Injectable()
export class OrderService implements OnModuleInit {
  userService: UserMicroservice.UserServiceClient;
  productService: ProductMicroservice.ProductServiceClient;
  paymentService: PaymentMicroservice.PaymentServiceClient;
  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroService: ClientGrpc,
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroService: ClientGrpc,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroService: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  onModuleInit() {
    this.userService =
      this.userMicroService.getService<UserMicroservice.UserServiceClient>(
        'UserService',
      );
    this.productService =
      this.productMicroService.getService<ProductMicroservice.ProductServiceClient>(
        'ProductService',
      );
    this.paymentService =
      this.paymentMicroService.getService<PaymentMicroservice.PaymentServiceClient>(
        'PaymentService',
      );
  }

  async createOrder(createOrderDto: CreateOrderDto, metadata: Metadata) {
    const { productIds, address, payment, meta } = createOrderDto;
    // 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(meta.user.sub, metadata);

    // 2) 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds, metadata);

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

    // 6) 결제 시도 +  주문 상태 업데이트
    const processedPayment = await this.processPayment(
      order._id.toString(),
      payment,
      user.email,
      metadata,
    );

    // 7) 결과 반환
    const orderModel = await this.orderModel.findById(order._id);
    if (!orderModel) {
      throw new InternalServerErrorException('서버에서 에러가 발생했습니다.');
    }
    return orderModel;
  }

  private async getUserFromToken(userId: string, metadata: Metadata) {
    // 1) User MS: JWT token 검증 => 이부분 Middleware + Guard에서 처리
    // const tokenResponse = await lastValueFrom(
    //   this.userService.send(
    //     {
    //       cmd: 'parse_bearer_token',
    //     },
    //     { token },
    //   ),
    // );
    // if (tokenResponse.status === 'error') {
    //   throw new PaymentCancelledException(tokenResponse);
    // }

    // 2) User MS: 사용자 정보 가져오기
    // const userId = tokenResponse.data.sub;
    try {
      const userResponse = await lastValueFrom(
        this.userService.getUserInfo(
          { userId },
          constructMetadata(OrderService.name, 'getUserFromToken', metadata),
        ),
      );
      return userResponse;
    } catch (error) {
      throw new PaymentCancelledException(error);
    }
  }

  private async getProductsByIds(
    productIds: string[],
    metadata: Metadata,
  ): Promise<OrderProduct[]> {
    try {
      const productResponse = await lastValueFrom(
        this.productService.getProductsInfo(
          {
            productIds,
          },
          constructMetadata(OrderService.name, 'getProductsByIds', metadata),
        ),
      );

      // Product Entity로 변환
      return productResponse.products.map((product) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
      }));
    } catch (error) {
      throw new PaymentCancelledException(error);
    }
  }

  private calculateTotalAmount(products: OrderProduct[]) {
    return products.reduce((acc, cur) => acc + cur.price, 0);
  }

  private validatePaymentAmount(clientAmount: number, serverAmount: number) {
    if (clientAmount !== serverAmount) {
      throw new PaymentCancelledException('결제하려는 금액이 변경되었습니다.');
    }
  }

  private createCustomer(user: {
    id: string;
    email: string;
    name: string;
  }): Customer {
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

  private async processPayment(
    orderId: string,
    paymentDto: PaymentDto,
    email: string,
    metadata: Metadata,
  ) {
    try {
      const paymentResponse = await lastValueFrom(
        this.paymentService.makePayment(
          {
            orderId,
            ...paymentDto,
            userEmail: email,
          },
          constructMetadata(OrderService.name, 'processPayment', metadata),
        ),
      );

      const isPaid = paymentResponse.paymentStatus === PaymentStatus.approved;
      const orderStatus = isPaid
        ? OrderStatus.paymentProcessed
        : OrderStatus.paymentFailed;

      if (orderStatus === OrderStatus.paymentFailed) {
        throw new PaymentFailedException(paymentResponse);
      }
      await this.orderModel.findByIdAndUpdate(orderId, {
        status: OrderStatus.paymentProcessed,
      });

      return paymentResponse;
    } catch (error) {
      if (error instanceof PaymentFailedException) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          status: OrderStatus.paymentFailed,
        });
      }
      throw error;
    }
  }

  async changeOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderModel.findByIdAndUpdate(orderId, { status });
  }
}
