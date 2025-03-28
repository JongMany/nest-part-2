import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // onModuleInit을 반드시 실행시키도록
  await app.init();

  await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap().then(() => {
  console.log('Connection on ', process.env.HTTP_PORT);
});
