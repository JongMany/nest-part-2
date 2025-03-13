import { ORDER_SERVICE, PRODUCT_SERVICE, USER_SERVICE } from '@app/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
@Module({
  imports: [
    OrderModule,
    ProductModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        USER_HOST: Joi.string().required(),
        USER_TCP_PORT: Joi.number().required(),
        PRODUCT_HOST: Joi.string().required(),
        PRODUCT_TCP_PORT: Joi.number().required(),
        ORDER_HOST: Joi.string().required(),
        ORDER_TCP_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          name: USER_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              // host: configService.getOrThrow<string>('USER_HOST'), // user container
              // port: configService.getOrThrow<number>('USER_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              host: 'redis',
              port: 6379,
            },
          }),
          inject: [ConfigService],
        },
        {
          name: PRODUCT_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              // host: configService.getOrThrow<string>('PRODUCT_HOST'), // user container
              // port: configService.getOrThrow<number>('PRODUCT_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              host: 'redis',
              port: 6379,
            },
          }),
          inject: [ConfigService],
        },
        {
          name: ORDER_SERVICE, // 여기서 설정된 name 기반으로 DI가 이뤄진다.
          useFactory: (configService: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              // host: configService.getOrThrow<string>('ORDER_HOST'), // user container
              // port: configService.getOrThrow<number>('ORDER_TCP_PORT'), // 모든 TCP 통신은 3001번에서 이뤄진다
              host: 'redis',
              port: 6379,
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BearerTokenMiddleware).forRoutes('order');
  }
}
