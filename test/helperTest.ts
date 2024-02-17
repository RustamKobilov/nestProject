import { CreateBlogDTO, CreateUserDto } from '../src/DTO';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { endpoints } from './routing';
import {
  AnswerViewModel,
  CreateAnswerDTO,
  CreateQuestionDTO,
  QuestionViewModel,
} from '../src/Qustions/questionDTO';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayerViewModel,
} from '../src/Quiz/gameDTO';
import { gameStatusesEnum } from '../src/Qustions/questionEnum';

export type CreateUserTest = {
  id: string;
  login: string;
  email: string;
  password: string;
};
export type TestingUserForRefreshAccessToken = {
  id: string;
  login: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
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
  async createAndLoginTestingUser(): Promise<TestingUserForRefreshAccessToken> {
    const inputUserTest = await this.createTestingUserForAdmin();
    const authorization = await this.getBasicAuthorization();
    const responseCreateUserForAdmin = await request(this.server)
      .post(endpoints.admin + '/users')
      .auth(authorization.username, authorization.password, {
        type: 'basic',
      })
      .send(inputUserTest);

    const userTestAfterCreate = {
      ...inputUserTest,
      id: responseCreateUserForAdmin.body.id,
    };

    const inputUserLoginAndPassword = {
      loginOrEmail: userTestAfterCreate.login,
      password: userTestAfterCreate.password,
    };

    const responseLoginUser = await request(this.server)
      .post(endpoints.authController.login)
      .send(inputUserLoginAndPassword);

    expect(responseLoginUser.status).toBe(200);
    expect(responseLoginUser.body.accessToken).toBeDefined();

    const accessToken = responseLoginUser.body.accessToken;
    const refreshTokenCookies = responseLoginUser.headers['set-cookie'];

    const refreshToken = await this.getRefreshTokenInCookie(
      responseLoginUser.headers['set-cookie'],
    );
    expect(refreshToken).not.toBe('refreshTokenUndefined');
    return {
      id: userTestAfterCreate.id,
      login: userTestAfterCreate.login,
      email: userTestAfterCreate.email,
      password: userTestAfterCreate.password,
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }
  async connectionQuizGameForUser1(
    refreshTokenUserForCreateGame: string,
    idUser: string,
    loginUser: string,
  ) {
    const responseConnectionUser1Test = await request(this.server)
      .post(endpoints.gameQuiz + '/pairs/connection')
      .set('Authorization', 'Bearer ' + refreshTokenUserForCreateGame);

    expect(responseConnectionUser1Test.status).toBe(200);
    expect(responseConnectionUser1Test.body).toEqual(<
      GamePairViewModelPendingSecondPlayerViewModel
    >{
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array<AnswerViewModel>),
        player: {
          id: idUser,
          login: loginUser,
        },
        score: expect.any(Number),
      },
      secondPlayerProgress: null,
      questions: null,
      status: gameStatusesEnum.PendingSecondPlayer,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
    return;
  }
  async connectionQuizGameForUser2(
    refreshTokenUserForCreateGame: string,
    idUser: string,
    loginUser: string,
  ): Promise<string> {
    const responseConnectionUser2Test = await request(this.server)
      .post(endpoints.gameQuiz + '/pairs/connection')
      .set('Authorization', 'Bearer ' + refreshTokenUserForCreateGame);

    expect(responseConnectionUser2Test.status).toBe(200);
    expect(responseConnectionUser2Test.body).toEqual(<GamePairViewModel>{
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array<AnswerViewModel>),
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: expect.any(Number),
      },
      secondPlayerProgress: {
        answers: expect.any(Array<AnswerViewModel>),
        player: {
          id: idUser,
          login: loginUser,
        },
        score: expect.any(Number),
      },
      questions: expect.any(Array<QuestionViewModel>),
      status: gameStatusesEnum.Active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
    const gameId = responseConnectionUser2Test.body.id;
    return gameId;
  }
  async createAnswerInGameFor2User(
    refreshTokenTheBestFasterUser: string,
    countCorrectAnswerTheBestFasterUser: number,
    refreshTokenUser1: string,
    countCorrectAnswerUser1: number,
  ) {
    //userFast
    for (let x = 0; x < 5; x++) {
      if (x < countCorrectAnswerTheBestFasterUser) {
        const responseCreateAnswerUser1Test = await request(this.server)
          .post(endpoints.gameQuiz + '/pairs/my-current/answers')
          .set('Authorization', 'Bearer ' + refreshTokenTheBestFasterUser)
          .send(<CreateAnswerDTO>{
            answer: 'answer',
          });
        expect(responseCreateAnswerUser1Test.status).toBe(200);
      } else {
        const responseCreateAnswerUser1Test = await request(this.server)
          .post(endpoints.gameQuiz + '/pairs/my-current/answers')
          .set('Authorization', 'Bearer ' + refreshTokenTheBestFasterUser)
          .send(<CreateAnswerDTO>{
            answer: 'answer false',
          });
        expect(responseCreateAnswerUser1Test.status).toBe(200);
      }
    }
    for (let x = 0; x < 5; x++) {
      if (x < countCorrectAnswerUser1) {
        const responseCreateAnswerUser1Test = await request(this.server)
          .post(endpoints.gameQuiz + '/pairs/my-current/answers')
          .set('Authorization', 'Bearer ' + refreshTokenUser1)
          .send(<CreateAnswerDTO>{
            answer: 'answer',
          });
        expect(responseCreateAnswerUser1Test.status).toBe(200);
      } else {
        const responseCreateAnswerUser1Test = await request(this.server)
          .post(endpoints.gameQuiz + '/pairs/my-current/answers')
          .set('Authorization', 'Bearer ' + refreshTokenUser1)
          .send(<CreateAnswerDTO>{
            answer: 'answer false',
          });
        expect(responseCreateAnswerUser1Test.status).toBe(200);
      }
    }
    return;
  }
  async getRefreshTokenInCookie(cookieArray: []) {
    const refreshTokenCookies = cookieArray.filter(function (val: string) {
      return val.split('=')[0] == 'refreshToken';
    });
    if (refreshTokenCookies.length === 0) {
      return 'refreshTokenUndefined';
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
        'answer',
      ],
      body: faker.lorem.word({ length: { min: 10, max: 500 } }),
    };
  }
}
