import { Controller } from '@nestjs/common';

import { ProductMicroservice } from '@app/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController
  implements ProductMicroservice.ProductServiceController
{
  constructor(private readonly productService: ProductService) {}

  // @Post('sample')
  // createSamples() {
  //   return this.productService.createSamples();
  // }
  // @MessagePattern({
  //   cmd: 'create_samples',
  // })
  // @UseInterceptors(RpcInterceptor)
  // @UsePipes(ValidationPipe)
  async createSamples() {
    const response = await this.productService.createSamples();
    return { success: response };
  }

  // @MessagePattern({
  //   cmd: 'get_products_info',
  // })
  // @UseInterceptors(RpcInterceptor)
  // @UsePipes(ValidationPipe)
  async getProductsInfo(payload: ProductMicroservice.GetProductsInfoRequest) {
    const response = await this.productService.getProductsInfo(
      payload.productIds,
    );
    return {
      products: response,
    };
  }
}
