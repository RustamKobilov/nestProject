import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { UserRepository } from '../User/userRepository';
import { Inject, Injectable } from '@nestjs/common';
import { BlogRepository } from '../Blog/blogRepository';
import { QuestionEntity } from '../Qustions/QuestionEntity';

@ValidatorConstraint({ name: 'IsEmailNoUnique', async: true })
@Injectable()
export class isEmailNoUniqueValidate implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}
  async validate(email: string, args: ValidationArguments) {
    console.log(email);
    const user = await this.userRepository.findUserByEmail(email);
    console.log(user);
    if (user) return false;
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
    console.log(user);
    if (user) return false;
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

@ValidatorConstraint({ name: 'IsBlogChecking', async: true })
@Injectable()
export class IsBlogCheckingValidate implements ValidatorConstraintInterface {
  constructor(private readonly blogRepository: BlogRepository) {}
  async validate(blogId: string, args: ValidationArguments) {
    const blog = await this.blogRepository.getBlog(blogId);
    if (blog) return true;
    return false;
  }
}

export function IsBlogChecking(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsBlogChecking',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogCheckingValidate,
    });
  };
}

@ValidatorConstraint({ name: 'IsEntityQuestionChecking', async: true })
@Injectable()
export class IsEntityQuestionCheckingValidate
  implements ValidatorConstraintInterface
{
  async validate(paramSortBy: string, args: ValidationArguments) {
    const keys = QuestionEntity.arguments;
    // if(keys<1){
    //   return false;
    // }
    console.log(keys);
    return true;
  }
}

export function IsEntityQuestionChecking(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsEntityQuestionChecking',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEntityQuestionCheckingValidate,
    });
  };
}
