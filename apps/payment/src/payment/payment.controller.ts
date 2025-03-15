import { Controller } from '@nestjs/common';

import { PaymentMicroservice } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController
  implements PaymentMicroservice.PaymentServiceController
{
  constructor(private readonly paymentService: PaymentService) {}

  // @MessagePattern({
  //   cmd: 'make_payment',
  // })
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  makePayment(payload: PaymentMicroservice.MakePaymentRequest) {
    return this.paymentService.makePayment({
      ...payload,
      paymentMethod: payload.paymentMethod as PaymentMethod,
    });
  }
}
