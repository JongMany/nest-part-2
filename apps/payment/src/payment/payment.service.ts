import { NOTIFICATION_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { Payment, PaymentStatus } from './entity/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly nofiticationService: ClientProxy,
  ) {}

  async makePayment(makePaymentDto: MakePaymentDto) {
    let paymentId: string = '';
    try {
      const result = await this.paymentRepository.save(makePaymentDto);
      paymentId = result.id;

      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      this.sendNotification(makePaymentDto.orderId, makePaymentDto.userEmail);

      return this.paymentRepository.findOneBy({ id: paymentId });
    } catch (error) {
      if (paymentId) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
      }
      throw error;
    }
  }

  private async processPayment() {
    // 실제 결제 로직이 들어가야 함.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async updatePaymentStatus(
    paymentId: string,
    paymentStatus: PaymentStatus,
  ) {
    await this.paymentRepository.update(
      {
        id: paymentId,
      },
      {
        paymentStatus,
      },
    );
  }

  private async sendNotification(orderId: string, to: string) {
    const response = await lastValueFrom(
      this.nofiticationService.send(
        {
          cmd: 'send_payment_notification',
        },
        {
          to,
          orderId,
        },
      ),
    );
  }
}
