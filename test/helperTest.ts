import { CreateUserDto } from '../src/DTO';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { endpoints } from './routing';

export type CreateUserTest = {
  id: string;
  login: string;
  email: string;
  password: string;
};

export class HelperTest {
  constructor(private readonly server: any) {}
  async getBasicAuthorization() {
    return {
      username: 'admin',
      password: 'qwerty',
    };
  }
  async createUsers(countOfUsers: number): Promise<CreateUserTest[]> {
    const authorization = await this.getBasicAuthorization();
    const users: any = [];
    for (let i = 0; i < countOfUsers; i++) {
      const inputUserData: CreateUserDto = {
        login: `user${i}`,
        email: `user${i}@email.com`,
        password: `password${i}`,
      };
      const response = await request(this.server)
        .post(endpoints.usersController)
        .auth(authorization.username, authorization.password, {
          type: 'basic',
        })
        .send(inputUserData);
      users.push({ id: response.body.id, ...inputUserData });
    }
    return users;
  }
  async createTestingUserForAdmin(): Promise<CreateUserDto> {
    return {
      login: faker.lorem.word({ length: { min: 3, max: 10 } }),
      password: faker.lorem.word({ length: { min: 6, max: 20 } }),
      email: faker.internet.exampleEmail(),
    };
  }
}
