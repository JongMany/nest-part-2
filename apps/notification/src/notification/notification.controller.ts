import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { NotificationMicroservice, RpcInterceptor } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController
  implements NotificationMicroservice.NotificationServiceController
{
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern({
    cmd: 'send_payment_notification',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async sendPaymentNotification(
    payload: NotificationMicroservice.SendPaymentNotificationRequest,
  ) {
    const response = await this.notificationService.sendPaymentNotification(payload);
    const data = response?.toJSON();
    return {
      ...data,
      status: data?.status.toString(),
    }
  }
}
