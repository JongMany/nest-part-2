import { PaymentModel } from 'apps/payment/src/payment/domain/payment.domain';
import { PaymentEntity } from '../entity/payment.entity';

export class PaymentEntityMapper {
  constructor(private readonly payment: PaymentEntity) {}

  toDomain() {
    const payment = new PaymentModel({
      paymentMethod: this.payment.paymentMethod,
      cardNumber: this.payment.cardNumber,
      expiryYear: this.payment.expiryYear,
      expiryMonth: this.payment.expiryMonth,
      birthOrRegistration: this.payment.birthOrRegistration,
      passwordTwoDigits: this.payment.passwordTwoDigits,
      amount: this.payment.amount,
      userEmail: this.payment.userEmail,
      orderId: this.payment.orderId,
    });
    payment.assignId(payment.id);
    return payment;
  }
}
