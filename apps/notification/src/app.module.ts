import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';

import { ORDER_SERVICE, OrderMicroservice } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
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
          name: ORDER_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            // transport: Transport.TCP,
            // transport: Transport.REDIS,
            // transport: Transport.RMQ,
            transport: Transport.GRPC,
            options: {
              // host: configService.getOrThrow<string>('ORDER_HOST'),
              // port: configService.getOrThrow<number>('ORDER_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              // host: 'redis',
              // port: 6379,
              // urls: ['amqp://rabbitmq:5672'],
              // queue: 'order_queue',
              // queueOptions: {
              //   durable: false,
              // },
              package: OrderMicroservice.protobufPackage,
              protoPath: join(process.cwd(), 'proto/order.proto'),
              url: configService.getOrThrow<string>('ORDER_GRPC_URL'),
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
