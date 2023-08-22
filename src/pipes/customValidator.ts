import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserRepository } from '../User/userRepository';

@ValidatorConstraint({ async: true })
export class emailCheckUnique implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}
  validate(email: string, args: ValidationArguments) {
    return this.userRepository.findUserByEmail(email).then((user) => {
      if (user) return false;
      return true;
    });
  }
}

@ValidatorConstraint({ async: true })
export class loginCheckUnique implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}
  validate(login: string, args: ValidationArguments) {
    return this.userRepository.findUserByLogin(login).then((user) => {
      if (user) return false;
      return true;
    });
  }
}

//TODO подключить validate
