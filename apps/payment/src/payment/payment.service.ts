import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { Payment, PaymentStatus } from './entity/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async makePayment(makePaymentDto: MakePaymentDto) {
    let paymentId: string = '';
    try {
      const result = await this.paymentRepository.save(makePaymentDto);
      paymentId = result.id;

      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      // TODO notification

      return this.paymentRepository.findOneBy({ id: paymentId });
    } catch (error) {
      if (paymentId) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
      }
      throw error;
    }
  }

  async processPayment() {
    // 실제 결제 로직이 들어가야 함.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async updatePaymentStatus(paymentId: string, paymentStatus: PaymentStatus) {
    await this.paymentRepository.update(
      {
        id: paymentId,
      },
      {
        paymentStatus,
      },
    );
  }
}
