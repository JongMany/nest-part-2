import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { PaymentMethod } from '../entity/payment.entity';

export class PaymentDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  paymentName: string;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  expiryYear: string;

  @IsString()
  @IsNotEmpty()
  expiryMonth: string;

  @IsString()
  @IsNotEmpty()
  birthOrRegistration: string;

  @IsString()
  @IsNotEmpty()
  passwordTwoDigits: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}
