import { Controller, UseInterceptors } from '@nestjs/common';

import { GrpcInterceptor, PaymentMicroservice } from '@app/common';
import { PaymentService } from '../../application/payment.service';
import { PaymentMethod } from '../../domain/payment.domain';

@Controller()
@UseInterceptors(GrpcInterceptor)
@PaymentMicroservice.PaymentServiceControllerMethods()
export class PaymentController
  implements PaymentMicroservice.PaymentServiceController
{
  constructor(private readonly paymentService: PaymentService) {}

  // @MessagePattern({
  //   cmd: 'make_payment',
  // })
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  makePayment(request: PaymentMicroservice.MakePaymentRequest) {
    return this.paymentService.makePayment({
      ...request,
      paymentMethod: request.paymentMethod as PaymentMethod,
    });
  }
}
