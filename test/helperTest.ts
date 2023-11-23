import { CreateBlogDTO, CreateUserDto } from '../src/DTO';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { endpoints } from './routing';
import { CreateQuestionDTO } from '../src/Qustions/questionDTO';

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
  async getRefreshTokenInCookie(cookieArray: []) {
    const refreshTokenCookies = cookieArray.filter(function (val: string) {
      return val.split('=')[0] == 'refreshToken';
    });
    if (refreshTokenCookies.length === 0) {
      return false;
    }
    const refreshToken = refreshTokenCookies
      .map(function (val: string) {
        return val.split('=')[1];
      })
      .map(function (val: string) {
        return val.split(';')[0];
      })[0];
    return refreshToken;
  }
  async createTestingUserForAdmin(): Promise<CreateUserDto> {
    return {
      login: faker.lorem.word({ length: { min: 3, max: 10 } }),
      password: faker.lorem.word({ length: { min: 6, max: 20 } }),
      email: faker.internet.exampleEmail(),
    };
  }
  async createTestingBlog(): Promise<CreateBlogDTO> {
    return {
      name: faker.lorem.word({ length: { min: 1, max: 15 } }),
      description: faker.lorem.word({ length: { min: 3, max: 500 } }),
      websiteUrl: faker.internet.url(),
    };
  }
  async createTestingQuestion(): Promise<CreateQuestionDTO> {
    return {
      correctAnswers: [
        faker.lorem.word({ length: { min: 10, max: 20 } }),
        faker.lorem.word({ length: { min: 10, max: 20 } }),
      ],
      body: faker.lorem.word({ length: { min: 10, max: 500 } }),
    };
  }
}
