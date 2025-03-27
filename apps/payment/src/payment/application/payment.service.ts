import { Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentModel } from '../domain/payment.domain';
import { DatabaseOutputPort } from '../port/output/database.output-port';
import { NetworkOutputPort } from '../port/output/network.output-port';
import { PaymentOutputPort } from '../port/output/payment.output-port';

class MakePaymentDto {
  orderId: string;
  userEmail: string;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrRegistration: string;
  passwordTwoDigits: string;
  amount: number;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly databaseOutputPort: DatabaseOutputPort,
    private readonly paymentOutputPort: PaymentOutputPort,
    private readonly networkOutputPort: NetworkOutputPort,
  ) {}

  async makePayment(makePaymentDto: MakePaymentDto) {
    // 1. 파라미터로 paymentModel을 생성 => 도메인 객체
    const payment = new PaymentModel(makePaymentDto);

    // 2. PaymentModel을 저장 => DB
    const result = await this.databaseOutputPort.savePayment(payment);

    // 3. 저장된 데이터의 ID를 PaymentModel에 저장 => 도메인 객체
    payment.assignId(result.id);

    try {
      // 4. 결제를 실행 => PG사 (HTTP)
      const isPaymentSuccess =
        await this.paymentOutputPort.processPayment(payment);
      if (isPaymentSuccess) {
        payment.processPayment();
      } else {
        throw new Error('Error');
      }

      // 5. 결제 데이터를 업데이트 => DB
      await this.databaseOutputPort.updatePayment(payment);
    } catch (error) {
      // 7. 실패한 경우(4,5) 결제를 Reject한다. => DB
      payment.rejectPayment();
      await this.databaseOutputPort.updatePayment(payment);
      return payment;
    }
    // 6. 알림을 보낸다. => gRPC
    this.networkOutputPort.sendNotification(
      makePaymentDto.orderId,
      makePaymentDto.userEmail,
    );

    return payment;
  }
}
