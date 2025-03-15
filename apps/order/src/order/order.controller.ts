import { Controller } from '@nestjs/common';

import { OrderMicroservice } from '@app/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entity/order.entity';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController
  implements OrderMicroservice.OrderServiceController
{
  constructor(private readonly orderService: OrderService) {}

  // @Post()
  // @UsePipes(ValidationPipe)
  // async createOrder(
  //   @GetAuthorization() token: string,
  //   @Body() createOrderDto: CreateOrderDto,
  // ) {
  //   return this.orderService.createOrder(createOrderDto, token);
  // }
  // @MessagePattern({
  //   cmd: 'create_order',
  // })
  async createOrder(request: OrderMicroservice.CreateOrderRequest) {
    return this.orderService.createOrder(request as CreateOrderDto);
  }

  // @EventPattern({
  //   cmd: 'delivery_started',
  // })
  // @UseInterceptors(RpcInterceptor)
  // @UsePipes(ValidationPipe)
  async deliveryStarted(request: OrderMicroservice.DeliveryStartedRequest) {
    await this.orderService.changeOrderStatus(
      request.id,
      OrderStatus.deliveryStarted,
    );
  }
}
