import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { GetAuthorization } from 'apps/user/src/auth/decorator/get-authorization.decorator';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createOrder(@GetAuthorization() token: string, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto, token);
  }
}
