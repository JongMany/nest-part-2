import {
  constructMetadata,
  PRODUCT_SERVICE,
  ProductMicroservice,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class ProductService implements OnModuleInit {
  productService: ProductMicroservice.ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.productService =
      this.productMicroservice.getService<ProductMicroservice.ProductServiceClient>(
        'ProductService',
      );
  }

  createSamples() {
    return this.productService.createSamples(
      {},
      constructMetadata(ProductService.name, 'createSamples'),
    );
  }
}
