import { Controller } from '@nestjs/common';

import { NotificationMicroservice } from '@app/common';
import { NotificationService } from './notification.service';
import { Metadata } from '@grpc/grpc-js';

@Controller()
@NotificationMicroservice.NotificationServiceControllerMethods()
export class NotificationController
  implements NotificationMicroservice.NotificationServiceController
{
  constructor(private readonly notificationService: NotificationService) {}

  // @MessagePattern({
  //   cmd: 'send_payment_notification',
  // })
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  async sendPaymentNotification(
    request: NotificationMicroservice.SendPaymentNotificationRequest,
    metadata: Metadata
  ) {
    const response =
      await this.notificationService.sendPaymentNotification(request, metadata);
    const data = response?.toJSON();
    return {
      ...data,
      status: data?.status.toString(),
    };
  }
}
