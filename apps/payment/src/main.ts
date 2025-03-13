import { NestFactory } from '@nestjs/core';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // MSA를 위한 설정
  app.connectMicroservice<MicroserviceOptions>({
    // transport: Transport.TCP,
    // transport: Transport.REDIS,
    transport: Transport.RMQ,
    options: {
      // host: '0.0.0.0', // 모든 곳에서 오는 요청을 받음
      // port: parseInt(process.env.TCP_PORT || '3001'),
      // host: 'redis',
      // port: 6379,
      urls: ['amqp://rabbitmq:5672'],
      queue: 'payment_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();

  // await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
