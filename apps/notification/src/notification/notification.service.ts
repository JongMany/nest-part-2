import { Injectable } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';

@Injectable()
export class NotificationService {
  async sendPaymentNotification(
    sendPaymentNotificationDto: SendPaymentNotificationDto,
  ) {
    
  }
}
