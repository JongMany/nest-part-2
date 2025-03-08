import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Order에서만 필요한 프로퍼티만 가져온다.
@Schema({
  _id: false,
})
export class Product {
  @Prop({
    required: true,
  })
  productId: string;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
