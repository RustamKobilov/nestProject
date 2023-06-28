import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import * as dotenv from 'dotenv'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //const configService = app.get(ConfigService);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  //const port = parseInt(configService.get('PORT'), 10);
  const port = parseInt(process.env.PORT!, 10);
  await app.listen(port, () => {
    console.log(`App started at ${port}`);
  });
}
bootstrap();
