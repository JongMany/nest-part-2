import { ORDER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { Notification, NotificationStatus } from './entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly orderService: ClientProxy,
  ) {}

  async sendPaymentNotification(
    sendPaymentNotificationDto: SendPaymentNotificationDto,
  ) {
    const { to, orderId } = sendPaymentNotificationDto;
    const notification = await this.createNotification(to);

    await this.sendEmail();
    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    // 메일을 보냈으면 배송이 시작되었다는 뜻
    this.sendDeliveryStartedMessage(orderId);

    return this.notificationModel.findById(notification._id);
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

  private async sendDeliveryStartedMessage(orderId: string) {
    this.orderService.emit(
      {
        cmd: 'delivery_started',
      },
      {
        id: orderId,
      },
    );
  }
}
