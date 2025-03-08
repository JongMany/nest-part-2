import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('connections is well');
  })
  .catch((error) => {
    console.log('user microservice has an error', error);
  });
