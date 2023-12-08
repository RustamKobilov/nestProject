import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import { HelperTest } from './helperTest';
import request from 'supertest';
import { endpoints } from './routing';
import { BlogViewModel } from '../src/viewModelDTO';
import { SaQuestionViewModel } from '../src/Qustions/questionDTO';
import { faker } from '@faker-js/faker';
import { outputModel } from '../src/DTO';

describe('test App', () => {
  jest.setTimeout(100 * 1000);

  let app: INestApplication;
  let server;
  let dataBaseServer;
  let helperTest;
  let basicAuthorization;
  let user1Test;
  let user2Test;
  let refreshTokenUser1Test;
  let refreshTokenCookiesUser1Test;
  let refreshTokenUser2Test;
  let refreshTokenCookiesUser2Test;
  // let blogTest;
  // let accessToken;
  let inputQuestionTest;
  let bodyInputQuestionTest;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await moduleFixture.createNestApplication();
    app = appSetting(app);
    await app.init();
    server = app.getHttpServer();
    helperTest = new HelperTest(server);
    const deleteBase = await request(server).delete(
      endpoints.testingController.allData,
    );
    basicAuthorization = await helperTest.getBasicAuthorization();
  });
  afterAll(async () => {
    await app.close();
    await dataBaseServer.stop();
  });

  describe('Question for Admin', () => {
    it('create Question for Admin', async () => {
      inputQuestionTest = await helperTest.createTestingQuestion();
      const response = await request(server)
        .post(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputQuestionTest);
      console.log(inputQuestionTest);
      console.log(' qustion create for admin');
      console.log(response.body);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(<SaQuestionViewModel>{
        id: expect.any(String),
        body: inputQuestionTest.body,
        correctAnswers: inputQuestionTest.correctAnswers,
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
      });
      bodyInputQuestionTest = response.body;
    });
    it('create falseQuestion for Admin', async () => {
      const inputQuestionTest = {
        correctAnswers: [5, 7],
        body: 'falseMin',
      };
      const response = await request(server)
        .post(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputQuestionTest);
      console.log(inputQuestionTest);
      console.log(' question create for admin');
      console.log(response.body);

      expect(response.status).toBe(400);
      console.log(response.body);
    });
    it('get Question for Admin', async () => {
      const response = await request(server)
        .get(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(<outputModel<SaQuestionViewModel>>{
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          <SaQuestionViewModel>{
            id: expect.any(String),
            body: inputQuestionTest.body,
            correctAnswers: inputQuestionTest.correctAnswers,
            published: false,
            createdAt: expect.any(String),
            updatedAt: null,
          },
        ],
      });
    });
    it('update Question for Admin', async () => {
      const updateQuestion = await helperTest.createTestingQuestion();
      const responseUpdate = await request(server)
        .put(endpoints.admin + '/quiz/questions/' + bodyInputQuestionTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(updateQuestion);
      expect(responseUpdate.status).toBe(204);
      const response = await request(server)
        .get(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          <SaQuestionViewModel>{
            id: expect.any(String),
            body: updateQuestion.body,
            correctAnswers: updateQuestion.correctAnswers,
            published: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      });
    });
    it('delete Question for Admin', async () => {
      const responseDelete = await request(server)
        .delete(endpoints.admin + '/quiz/questions/' + bodyInputQuestionTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(responseDelete.status).toBe(204);
      const response = await request(server)
        .get(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(<outputModel<SaQuestionViewModel>>{
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });
  describe('gameQuiz ', () => {
    it('create Users for Admin and Login', async () => {
      const inputUser1Test = await helperTest.createTestingUserForAdmin();

      const responseCreateUser1 = await request(server)
        .post(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputUser1Test);

      expect(responseCreateUser1.status).toBe(201);
      expect(responseCreateUser1.body).toBeDefined();
      expect(responseCreateUser1.body).toEqual({
        id: expect.any(String),
        login: inputUser1Test.login,
        email: inputUser1Test.email,
        createdAt: expect.any(String),
      });
      user1Test = inputUser1Test;
      user1Test.id = responseCreateUser1.body.id;
      const inputUserLoginAndPassword = {
        loginOrEmail: user1Test.login,
        password: user1Test.password,
      };
      //console.log(inputUserLoginAndPassword);
      const responseLoginUser1 = await request(server)
        .post(endpoints.authController.login)
        .send(inputUserLoginAndPassword);

      expect(responseLoginUser1.status).toBe(200);
      expect(responseLoginUser1.body.accessToken).toBeDefined();
      //accessToken = response.body.accessToken;
      //expect(response.body.accessToken).toBeDefined();
      refreshTokenCookiesUser1Test = responseLoginUser1.headers['set-cookie'];
      refreshTokenUser1Test = await helperTest.getRefreshTokenInCookie(
        responseLoginUser1.headers['set-cookie'],
      );
      expect(refreshTokenUser1Test).not.toBe(false);

      ///user2
      const inputUser2Test = await helperTest.createTestingUserForAdmin();

      const responseCreateUser2 = await request(server)
        .post(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputUser2Test);

      expect(responseCreateUser2.status).toBe(201);
      expect(responseCreateUser2.body).toBeDefined();
      expect(responseCreateUser2.body).toEqual({
        id: expect.any(String),
        login: inputUser2Test.login,
        email: inputUser2Test.email,
        createdAt: expect.any(String),
      });
      user2Test = inputUser2Test;
      user2Test.id = responseCreateUser2.body.id;

      const inputUserLoginAndPassword = {
        loginOrEmail: user2Test.login,
        password: user2Test.password,
      };
      //console.log(inputUserLoginAndPassword);
      const responseLoginUser2 = await request(server)
        .post(endpoints.authController.login)
        .send(inputUserLoginAndPassword);

      expect(responseLoginUser2.status).toBe(200);
      expect(responseLoginUser2.body.accessToken).toBeDefined();
      //accessToken = response.body.accessToken;
      //expect(response.body.accessToken).toBeDefined();
      refreshTokenCookiesUser2Test = responseLoginUser2.headers['set-cookie'];
      refreshTokenUser2Test = await helperTest.getRefreshTokenInCookie(
        responseLoginUser2.headers['set-cookie'],
      );
      expect(refreshTokenUser2Test).not.toBe(false);
    });
    it('connection game for player1', async () => {
      const responseConnectionUser1Test = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenCookiesUser1Test);
    });
  });
});
