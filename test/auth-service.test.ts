import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import request from 'supertest';
import { HelperTest } from './helperTest';
import { endpoints } from './routing';
import { UserViewModel } from '../src/viewModelDTO';

dotenv.config();
describe('integration test for AuthService', () => {
  jest.setTimeout(100 * 1000);

  let app: INestApplication;
  let server;
  let mongoMemoryServer;
  let helperTest;
  let basicAuthorization;

  beforeAll(async () => {
    // mongoMemoryServer = await MongoMemoryServer.create();
    // const mongoUri = mongoMemoryServer.getUri();
    // console.log(mongoUri);
    // process.env['MONGO_URI_CLUSTER'] = mongoUri;
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
    await mongoMemoryServer.stop();
  });

  describe('createUser', () => {
    let userTest;
    it('create User for Admin', async () => {
      const inputUserTest = await helperTest.createTestingUserForAdmin();
      console.log(inputUserTest);
      const response = await request(server)
        .post(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputUserTest);
      console.log(response.body);

      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        id: expect.any(String),
        login: inputUserTest.login,
        email: inputUserTest.email,
        createdAt: expect.any(String),
      });
      console.log(userTest);
      console.log(response.body.id);
      userTest = inputUserTest;
      userTest.id = response.body.id;
    });
    it('get users', async () => {
      const response = await request(server)
        .get(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        pagesCount: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        //TODO как в items првоерить массив типов
        items: expect.anything(),
      });
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].id).toEqual(userTest.id);
    });
  });
});
