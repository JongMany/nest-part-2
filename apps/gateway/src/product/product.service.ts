import { PRODUCT_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientProxy,
  ) {}
  createSamples() {
    return this.productMicroservice.send(
      {
        cmd: 'create_samples',
      },
      {},
    );
  }
}
