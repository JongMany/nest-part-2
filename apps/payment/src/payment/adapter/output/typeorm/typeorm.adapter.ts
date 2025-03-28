import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentModel } from '../../../domain/payment.domain';
import { DatabaseOutputPort } from '../../../port/output/database.output-port';
import { PaymentEntity } from './entity/payment.entity';
import { PaymentEntityMapper } from './mapper/payment-entity.mapper';

export class TypeOrmAdapter implements DatabaseOutputPort {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async savePayment(payment: PaymentModel): Promise<PaymentModel> {
    const result = await this.paymentRepository.save(payment);
    return new PaymentEntityMapper(result).toDomain();
  }
  async updatePayment(payment: PaymentModel): Promise<PaymentModel> {
    await this.paymentRepository.update(payment.id, payment);

    const result = await this.paymentRepository.findOne({
      where: {
        id: payment.id,
      },
    });
    if (!result) {
      throw new Error();
    }
    return new PaymentEntityMapper(result).toDomain();
  }
}
