import {
  constructMetadata,
  ORDER_SERVICE,
  OrderMicroservice,
} from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { Notification, NotificationStatus } from './entity/notification.entity';

@Injectable()
export class NotificationService implements OnModuleInit {
  orderService: OrderMicroservice.OrderServiceClient;

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.orderService =
      this.orderMicroservice.getService<OrderMicroservice.OrderServiceClient>(
        'OrderService',
      );
  }

  async sendPaymentNotification(
    sendPaymentNotificationDto: SendPaymentNotificationDto,
    metadata: Metadata,
  ) {
    const { to, orderId } = sendPaymentNotificationDto;
    const notification = await this.createNotification(to);

    await this.sendEmail();
    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    // 메일을 보냈으면 배송이 시작되었다는 뜻
    this.sendDeliveryStartedMessage(orderId, metadata);

    const response = await this.notificationModel.findById(notification._id);
    if (!response) {
      throw new InternalServerErrorException('서버에서 에러가 발생했습니다.');
    }
    return response;
  }

  private async createNotification(to: string) {
    return this.notificationModel.create({
      from: 'blackberry1114@naver.com',
      to,
      subject: '배송이 시작되었습니다.',
      content: `${to}님! 주문하신 물건이 배송 시작되었습니다.`,
    });
  }

  private async sendEmail() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
  ) {
    return this.notificationModel.findByIdAndUpdate(notificationId, {
      status,
    });
  }

  private async sendDeliveryStartedMessage(
    orderId: string,
    metadata: Metadata,
  ) {
    this.orderService.deliveryStarted(
      {
        id: orderId,
      },
      constructMetadata(
        NotificationService.name,
        'sendDeliveryStartedMessage',
        metadata,
      ),
    );
  }
}
