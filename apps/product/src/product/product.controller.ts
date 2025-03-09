import {
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { RpcInterceptor } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetProductsInfoDto } from './dto/get-products-info.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('sample')
  createSamples() {
    return this.productService.createSamples();
  }

  @MessagePattern({
    cmd: 'get_products_info',
  })
  @UseInterceptors(RpcInterceptor)
  @UsePipes(ValidationPipe)
  getProductsInfo(@Payload() payload: GetProductsInfoDto) {
    return this.productService.getProductsInfo(payload.productIds);
  }
}
