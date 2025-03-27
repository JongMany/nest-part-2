import { Controller, UseInterceptors } from '@nestjs/common';

import { GrpcInterceptor, PaymentMicroservice } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { PaymentMethod } from '../../domain/payment.domain';
import { PaymentService } from '../../payment.service';

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
  makePayment(
    request: PaymentMicroservice.MakePaymentRequest,
    metadata: Metadata,
  ) {
    return this.paymentService.makePayment(
      {
        ...request,
        paymentMethod: request.paymentMethod as PaymentMethod,
      },
      metadata,
    );
  }
}
