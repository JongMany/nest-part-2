import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then((res) => {
    console.log('results', res);
  })
  .catch((error) => {
    console.log('user microservice has an error', error);
  });
