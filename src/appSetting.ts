import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './exeptionFilters/exeption.filter';
import { GlobalValidationPipe } from './pipes/validation.pipe';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
//import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file

export const appSetting = (app: INestApplication) => {
  app.enableCors();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  //AppModule useContainer(app.select(SharedModule), { fallbackOnErrors: true })
  app.useGlobalPipes(GlobalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  return app;
};
