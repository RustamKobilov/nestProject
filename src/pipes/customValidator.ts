import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { UserRepository } from '../User/userRepository';
import { Inject, Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsEmailNoUnique', async: true })
@Injectable()
export class isEmailNoUniqueValidate implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}
  async validate(email: string, args: ValidationArguments) {
    console.log(email);
    const user = await this.userRepository.findUserByEmail(email);
    console.log('ya v validate');
    console.log(user);
    if (user) return false;
    console.log('y menya zaebis');
    return true;
  }
}
export function IsEmailNoUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsEmailNoUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: isEmailNoUniqueValidate,
    });
  };
}

@ValidatorConstraint({ name: 'IsLoginNoUnique', async: true })
@Injectable()
export class IsLoginNoUniqueValidate implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}
  async validate(login: string, args: ValidationArguments) {
    console.log(login);
    const user = await this.userRepository.findUserByLogin(login);
    console.log('ya v validate');
    console.log(user);
    if (user) return false;
    console.log('y menya zaebis');
    return true;
  }
}

export function IsLoginNoUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsLoginNoUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLoginNoUniqueValidate,
    });
  };
}

// @ValidatorConstraint({ async: true })
// export class loginCheckUnique implements ValidatorConstraintInterface {
//   constructor(private readonly userRepository: UserRepository) {}
//   validate(login: string, args: ValidationArguments) {
//     return this.userRepository.findUserByLogin(login).then((user) => {
//       if (user) return false;
//       return true;
//     });
//   }
// }

//TODO подключить validate
