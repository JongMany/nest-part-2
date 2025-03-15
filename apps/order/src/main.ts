import { NestFactory } from '@nestjs/core';

import { OrderMicroservice } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = await app.get(ConfigService);

  // MSA를 위한 설정
  app.connectMicroservice<MicroserviceOptions>({
    // transport: Transport.TCP,
    // transport: Transport.REDIS,
    // transport: Transport.RMQ,
    transport: Transport.GRPC,
    options: {
      // host: '0.0.0.0', // 모든 곳에서 오는 요청을 받음
      // port: parseInt(process.env.TCP_PORT || '3001'),
      // host: 'redis',
      // port: 6379,
      // urls: ['amqp://rabbitmq:5672'],
      // queue: 'order_queue',
      // queueOptions: {
      //   durable: false,
      // },
      package: OrderMicroservice.protobufPackage,
      protoPath: join(process.cwd(), 'proto/order.proto'),
      url: configService.getOrThrow<string>('GRPC_URL'),
    },
  });
  await app.startAllMicroservices();

  // await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap()
  .then(() => {})
  .catch((error) => {
    console.log('order MSA error: ', error);
  });
