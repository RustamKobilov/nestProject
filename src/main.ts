import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { appSetting } from './appSetting';
import { useContainer } from 'class-validator';
dotenv.config();

async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = appSetting(rawApp);
  const port = parseInt(process.env.PORT!, 10);
  await app.listen(port, () => {
    console.log(`App started at ${port}`);
  });
}
bootstrap();
