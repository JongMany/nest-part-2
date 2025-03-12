import { ORDER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientProxy,
  ) {}
  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    return lastValueFrom(
      this.orderMicroservice.send(
        {
          cmd: 'create_order',
        },
        {
          ...createOrderDto,
          token,
        },
      ),
    );
  }
}
