import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './adapter/input/payment.controller';
import { PaymentEntity } from './adapter/output/typeorm/entity/payment.entity';
import { PaymentService } from './application/payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
