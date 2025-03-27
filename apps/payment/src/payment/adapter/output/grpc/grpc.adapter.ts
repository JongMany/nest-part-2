import { NOTIFICATION_SERVICE, NotificationMicroservice } from '@app/common';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NetworkOutputPort } from '../../../port/output/network.output-port';

export class GrpcAdapter implements NetworkOutputPort, OnModuleInit {
  notificationService: NotificationMicroservice.NotificationServiceClient;
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.notificationService =
      this.notificationMicroservice.getService<NotificationMicroservice.NotificationServiceClient>(
        'NotificationService', // proto 파일의 서비스명
      );
  }

  async sendNotification(orderId: string, to: string) {
    await lastValueFrom(
      this.notificationService.sendPaymentNotification(
        {
          to,
          orderId,
        },
        // constructMetadata(PaymentService.name, 'sendNotification', metadata),
      ),
    );
  }
}
