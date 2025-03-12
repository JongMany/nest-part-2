import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetAuthorization } from '../auth/decorator/get-authorization.decorator';
import { TokenGuard } from '../auth/guard/token.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(TokenGuard)
  async createOrder(
    @GetAuthorization() token: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(createOrderDto, token);
  }
}
