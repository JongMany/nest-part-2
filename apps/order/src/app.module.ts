import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';

import {
  PAYMENT_SERVICE,
  PaymentMicroservice,
  PRODUCT_SERVICE,
  ProductMicroservice,
  traceInterceptor,
  USER_SERVICE,
  UserMicroservice,
} from '@app/common';
import { join } from 'path';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    OrderModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        USER_HOST: Joi.string().required(),
        USER_TCP_PORT: Joi.number().required(),
        PRODUCT_HOST: Joi.string().required(),
        PRODUCT_TCP_PORT: Joi.number().required(),
        PAYMENT_HOST: Joi.string().required(),
        PAYMENT_TCP_PORT: Joi.number().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    // MS 통신 대상 설정
    ClientsModule.registerAsync({
      clients: [
        {
          name: USER_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            // transport: Transport.TCP,
            // transport: Transport.REDIS,
            // transport: Transport.RMQ,
            transport: Transport.GRPC,
            options: {
              // host: configService.getOrThrow<string>('USER_HOST'), // user container
              // port: configService.getOrThrow<number>('USER_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              // host: 'redis',
              // port: 6379,
              // urls: ['amqp://rabbitmq:5672'],
              // queue: 'user_queue',
              // queueOptions: {
              //   durable: false,
              // },
              channelOptions: {
                interceptors: [traceInterceptor('Order')],
              },
              package: UserMicroservice.protobufPackage,
              protoPath: join(process.cwd(), 'proto/user.proto'),
              url: configService.getOrThrow<string>('USER_GRPC_URL'),
            },
          }),
          inject: [ConfigService],
        },
        {
          name: PRODUCT_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            // transport: Transport.TCP,
            // transport: Transport.REDIS,
            // transport: Transport.RMQ,
            transport: Transport.GRPC,
            options: {
              // host: configService.getOrThrow<string>('PRODUCT_HOST'), // user container
              // port: configService.getOrThrow<number>('PRODUCT_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              // host: 'redis',
              // port: 6379,
              // urls: ['amqp://rabbitmq:5672'],
              // queue: 'product_queue',
              // queueOptions: {
              //   durable: false,
              // },
              channelOptions: {
                interceptors: [traceInterceptor('Order')],
              },
              package: ProductMicroservice.protobufPackage,
              protoPath: join(process.cwd(), 'proto/product.proto'),
              url: configService.getOrThrow<string>('PRODUCT_GRPC_URL'),
            },
          }),
          inject: [ConfigService],
        },
        {
          name: PAYMENT_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            // transport: Transport.TCP,
            // transport: Transport.REDIS,
            // transport: Transport.RMQ,
            transport: Transport.GRPC,
            options: {
              // host: configService.getOrThrow<string>('PAYMENT_HOST'), // user container
              // port: configService.getOrThrow<number>('PAYMENT_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              // host: 'redis',
              // port: 6379,
              // urls: ['amqp://rabbitmq:5672'],
              // queue: 'payment_queue',
              // queueOptions: {
              //   durable: false,
              // },
              channelOptions: {
                interceptors: [traceInterceptor('Order')],
              },
              package: PaymentMicroservice.protobufPackage,
              protoPath: join(process.cwd(), 'proto/payment.proto'),
              url: configService.getOrThrow<string>('PAYMENT_GRPC_URL'),
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
