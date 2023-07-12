import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { appSetting } from './appSetting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSetting(app);
  const port = parseInt(process.env.PORT!, 10);
  await app.listen(port, () => {
    console.log(`App started at ${port}`);
  });
}
bootstrap();
