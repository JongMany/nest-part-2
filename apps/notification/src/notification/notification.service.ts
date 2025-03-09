import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { Notification, NotificationStatus } from './entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
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

    return this.notificationModel.findById(notification._id);
  }

  async createNotification(to: string) {
    return this.notificationModel.create({
      from: 'blackberry1114@naver.com',
      to,
      subject: '배송이 시작되었습니다.',
      content: `${to}님! 주문하신 물건이 배송 시작되었습니다.`,
    });
  }

  async sendEmail() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
  ) {
    return this.notificationModel.findByIdAndUpdate(notificationId, {
      status,
    });
  }
}
