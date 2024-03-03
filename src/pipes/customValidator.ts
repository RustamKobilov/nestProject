import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserRepository } from '../User/userRepository';
import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../Blog/blogRepository';
import { Metadata } from 'sharp';

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
//TODO выводить в validationPipe ?

// @ValidatorConstraint({ name: 'IsEntityQuestionChecking', async: true })
// @Injectable()
// export class SizeImageValidate implements ValidatorConstraintInterface {
//   async validate(
//     metadateImage: Metadata,
//     imageFormat: string[],
//     imageSize: number,
//     imageWidth: number,
//     imageHeight: number,
//     args: ValidationArguments,
//   ) {
//     console.log(metadateImage);
//     //const imageFormat = ['png', 'jpeg', 'jpg'];
//     if (!imageFormat.includes(metadateImage.format as string)) {
//       console.log('format invalid');
//       //throw new BadRequestException('format invalid');
//       return false;
//     }
//     if (!metadateImage.size || metadateImage.size > imageSize) {
//       console.log('size invalid');
//       //throw new BadRequestException('size invalid');
//       return false;
//     }
//     if (
//       !metadateImage.width ||
//       !metadateImage.height ||
//       metadateImage.width > imageWidth ||
//       metadateImage.height > imageHeight
//     ) {
//       console.log('width&height invalid');
//       // throw new BadRequestException('width&height invalid');
//       return false;
//     }
//     return true;
//   }
// }
//
// export function IsSizeImageValidate(validationOptions?: ValidationOptions) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       name: 'IsSizeImageValidate',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [],
//       validator: SizeImageValidate,
//     });
//   };
// }
