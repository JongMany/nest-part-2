import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { PaymentModule } from './payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from '@app/common';

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
            transport: Transport.TCP,
            options: {
              host: configService.getOrThrow<string>('NOTIFICATION_HOST'), 
              port: configService.getOrThrow<number>('NOTIFICATION_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
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
