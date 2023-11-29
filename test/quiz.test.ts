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

describe('test App', () => {
  jest.setTimeout(100 * 1000);

  let app: INestApplication;
  let server;
  let dataBaseServer;
  let helperTest;
  let basicAuthorization;
  let userTest;
  let blogTest;
  let accessToken;
  let refreshToken;
  let refreshTokenCookies;

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
      const inputQuestionTest = await helperTest.createTestingQuestion();

      const response = await request(server)
        .post(endpoints.admin + '/quiz')
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
        updatedAt: expect.any(String),
      });
    });
    it('create falseQuestion for Admin', async () => {
      const inputQuestionTest = {
        correctAnswers: [5, 7],
        body: '10stringtrue',
      };
      const response = await request(server)
        .post(endpoints.admin + '/quiz')
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
  });
});
