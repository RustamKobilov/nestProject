import { ValidationError } from 'class-validator';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

const prepareErrorResult = (errors: ValidationError[]) => {
  const result = [];
  errors.forEach((e) => {
    const constraintsKeys = Object.keys(e.constraints!);
    result.push({
      message: e.constraints?.[constraintsKeys[0]],
      field: e.property,
    } as never);
  });
  return result;
};

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  stopAtFirstError: true,
  exceptionFactory: (errors: ValidationError[]) => {
    throw new BadRequestException(prepareErrorResult(errors));
  },
});
