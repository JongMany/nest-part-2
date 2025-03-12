import { PRODUCT_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}
  createSamples() {
    return this.productService.send(
      {
        cmd: 'create_samples',
      },
      {},
    );
  }
}
