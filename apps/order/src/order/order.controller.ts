import { Body, Controller, Post } from '@nestjs/common';
import { GetAuthorization } from 'apps/user/src/auth/decorator/get-authorization.decorator';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  // @UsePipes(ValidationPipe)
  async createOrder(
    @GetAuthorization() token: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(createOrderDto, token);
  }
}
