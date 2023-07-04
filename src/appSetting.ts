import { INestApplication, ValidationPipe } from '@nestjs/common';

export const appSetting = (app: INestApplication) => {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
};
