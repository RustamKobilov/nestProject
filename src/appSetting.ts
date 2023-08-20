import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './exeptionFilters/exeption.filter';
import { GlobalValidationPipe } from './pipes/validation.pipe';
//import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file

export const appSetting = (app: INestApplication) => {
  app.enableCors();
  app.useGlobalPipes(GlobalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  return app;
};
