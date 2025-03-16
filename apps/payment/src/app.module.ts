import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

import {
  NOTIFICATION_SERVICE,
  NotificationMicroservice,
  traceInterceptor,
} from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    PaymentModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow('DB_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          name: NOTIFICATION_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            // transport: Transport.TCP,
            // transport: Transport.REDIS,
            // transport: Transport.RMQ,
            transport: Transport.GRPC,
            options: {
              // host: configService.getOrThrow<string>('NOTIFICATION_HOST'),
              // port: configService.getOrThrow<number>('NOTIFICATION_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              // host: 'redis',
              // port: 6379,
              // urls: ['amqp://rabbitmq:5672'],
              // queue: 'notification_queue',
              // queueOptions: {
              //   durable: false,
              // },
              channelOptions: {
                interceptors: [traceInterceptor('Payment')],
              },
              package: NotificationMicroservice.protobufPackage,
              protoPath: join(process.cwd(), 'proto/notification.proto'),
              url: configService.getOrThrow<string>('NOTIFICATION_GRPC_URL'),
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
