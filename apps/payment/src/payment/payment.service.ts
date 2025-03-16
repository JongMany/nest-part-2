import {
  constructMetadata,
  NOTIFICATION_SERVICE,
  NotificationMicroservice,
} from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { Payment, PaymentStatus } from './entity/payment.entity';

@Injectable()
export class PaymentService implements OnModuleInit {
  notificationService: NotificationMicroservice.NotificationServiceClient;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.notificationService =
      this.notificationMicroservice.getService<NotificationMicroservice.NotificationServiceClient>(
        'NotificationService', // proto 파일의 서비스명
      );
  }

  async makePayment(makePaymentDto: MakePaymentDto, metadata: Metadata) {
    let paymentId: string = '';
    try {
      const result = await this.paymentRepository.save(makePaymentDto);
      paymentId = result.id;

      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      // 이 부분은 message pattern (주문 상태가 변경될 때)
      this.sendNotification(
        makePaymentDto.orderId,
        makePaymentDto.userEmail,
        metadata,
      );

      const payment = await this.paymentRepository.findOneBy({ id: paymentId });
      if (!payment) {
        throw new InternalServerErrorException(
          '서버에서 에러가 발생했습니다. 다시 시도해주세요',
        );
      }
      return payment;
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

  private async sendNotification(
    orderId: string,
    to: string,
    metadata: Metadata,
  ) {
    const response = await lastValueFrom(
      this.notificationService.sendPaymentNotification(
        {
          to,
          orderId,
        },
        constructMetadata(PaymentService.name, 'sendNotification', metadata),
      ),
    );
  }
}
