import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { RpcInterceptor } from '@app/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { OrderStatus } from './entity/order.entity';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Post()
  // @UsePipes(ValidationPipe)
  // async createOrder(
  //   @GetAuthorization() token: string,
  //   @Body() createOrderDto: CreateOrderDto,
  // ) {
  //   return this.orderService.createOrder(createOrderDto, token);
  // }

  @EventPattern({
    cmd: 'delivery_started',
  })
  @UseInterceptors(RpcInterceptor)
  @UsePipes(ValidationPipe)
  async deliveryStarted(@Payload() payload: DeliveryStartedDto) {
    await this.orderService.changeOrderStatus(
      payload.id,
      OrderStatus.deliveryStarted,
    );
  }
}
