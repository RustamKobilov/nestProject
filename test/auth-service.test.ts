import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import request from 'supertest';
import { HelperTest } from './helperTest';
import { endpoints } from './routing';
import { BlogViewModel, MeViewModel, UserViewModel } from '../src/viewModelDTO';

describe('test App', () => {
  jest.setTimeout(100 * 1000);

  let app: INestApplication;
  let server;
  let mongoMemoryServer;
  let helperTest;
  let basicAuthorization;
  let userTest;
  let blogTest;
  let accessToken;
  let refreshToken;
  let refreshTokenCookies;

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

  describe('CRUD User for Admin', () => {
    it('create User for Admin', async () => {
      const inputUserTest = await helperTest.createTestingUserForAdmin();

      const response = await request(server)
        .post(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputUserTest);
      console.log(inputUserTest);
      console.log(' user for create for admin');
      console.log(response.body);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        id: expect.any(String),
        login: inputUserTest.login,
        email: inputUserTest.email,
        createdAt: expect.any(String),
      });
      userTest = inputUserTest;
      userTest.id = response.body.id;
      console.log(userTest);
      console.log(' add id');
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
        items: expect.any(Array),
      });
      expect(Array.isArray(response.body.items)).toBeTruthy();
      for (const u of response.body.items) {
        expect(u).toStrictEqual(<UserViewModel>{
          id: expect.any(String),
          email: expect.any(String),
          login: expect.any(String),
          createdAt: expect.any(String),
        });
      }
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].id).toEqual(userTest.id);
    });
    it('delete user by id', async () => {
      const response = await request(server)
        .delete(endpoints.usersController + '/' + userTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(204);
      const responseGet = await request(server)
        .get(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.body).toBeDefined();
      expect(responseGet.body.items).toHaveLength(0);
    });
  });
  describe('CRUD Blog', () => {
    it('create blog', async () => {
      const inputBlogTest = await helperTest.createTestingBlog();
      const response = await request(server)
        .post(endpoints.admin + endpoints.blogController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputBlogTest);
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(<BlogViewModel>{
        id: expect.any(String),
        createdAt: expect.any(String),
        description: inputBlogTest.description,
        name: inputBlogTest.name,
        websiteUrl: inputBlogTest.websiteUrl,
        isMembership: false,
      });
      blogTest = { ...response.body };
    });
    it('get blogs', async () => {
      const response = await request(server).get(endpoints.blogController);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        pagesCount: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: expect.any(Array),
      });
      expect(Array.isArray(response.body.items)).toBeTruthy();
      for (const u of response.body.items) {
        expect(u).toStrictEqual(<BlogViewModel>{
          id: expect.any(String),
          createdAt: expect.any(String),
          description: expect.any(String),
          name: expect.any(String),
          websiteUrl: expect.any(String),
          isMembership: expect.any(Boolean),
        });
      }
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].id).toEqual(blogTest.id);
    });
    it('get blog by id', async () => {
      const createDifferentBlog = await helperTest.createTestingBlog();
      const responseCreateDifferentBlog = await request(server)
        .post(endpoints.admin + endpoints.blogController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(createDifferentBlog);
      expect(responseCreateDifferentBlog.status).toBe(201);
      expect(responseCreateDifferentBlog.body).toBeDefined();
      const responseGet = await request(server).get(
        endpoints.blogController + '/' + blogTest.id,
      );
      expect(responseGet.status).toBe(200);
      expect(responseGet.body).toBeDefined();
      expect(responseGet.body).toEqual(blogTest);
    });
    it('update blog by id', async () => {
      const createUpdateBlog = await helperTest.createTestingBlog();
      const responseUpdateBlog = await request(server)
        .put(endpoints.admin + endpoints.blogController + '/' + blogTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(createUpdateBlog);
      expect(responseUpdateBlog.status).toBe(204);
      const responseGet = await request(server).get(
        endpoints.blogController + '/' + blogTest.id,
      );
      expect(responseGet.status).toBe(200);
      expect(responseGet.body).toBeDefined();
      expect(responseGet.body).toEqual({
        id: blogTest.id,
        ...createUpdateBlog,
        createdAt: blogTest.createdAt,
        isMembership: blogTest.isMembership,
      });
      blogTest = { ...responseGet.body };
    });
    it('delete blog by id', async () => {
      const responseDelete = await request(server)
        .delete(endpoints.admin + endpoints.blogController + '/' + blogTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(responseDelete.status).toBe(204);
      const responseGet = await request(server).get(endpoints.blogController);
      expect(responseGet.status).toBe(200);
      expect(responseGet.body).toBeDefined();
      expect(responseGet.body.items).toHaveLength(1);
      expect(responseGet.body.items[0].id).not.toBe(blogTest.id);
    });
  });
  describe('auth controller', () => {
    it('/create user for admin', async () => {
      const inputUserTest = await helperTest.createTestingUserForAdmin();
      const response = await request(server)
        .post(endpoints.usersController)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(inputUserTest);
      userTest = inputUserTest;
      userTest.id = response.body.id;
    });
    it('/login', async () => {
      const inputUserLoginAndPassword = {
        loginOrEmail: userTest.login,
        password: userTest.password,
      };
      console.log(inputUserLoginAndPassword);
      const response = await request(server)
        .post(endpoints.authController.login)
        .send(inputUserLoginAndPassword);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      accessToken = response.body.accessToken;
      refreshTokenCookies = response.headers['set-cookie'];
      expect(response.body.accessToken).toBeDefined();
      refreshToken = await helperTest.getRefreshTokenInCookie(
        response.headers['set-cookie'],
      );
      expect(refreshToken).not.toBe(false);
    });
    it('/me', async () => {
      const response = await request(server)
        .get(endpoints.authController.me)
        .set('Authorization', 'Bearer ' + accessToken);
      console.log(response.text);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      console.log(response.body);
      expect(response.body).toEqual(<MeViewModel>{
        login: userTest.login,
        email: userTest.email,
        userId: userTest.id,
      });
    });
    it('/refreshToken', async () => {
      console.log('acсessToken');
      console.log(accessToken);
      const response = await request(server)
        .post(endpoints.authController.refreshToken)
        .set('Cookie', [refreshTokenCookies]);
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      console.log(' response.body.access');
      console.log(response.body.accessToken);
      //TODO почему not.toBe. не работает если поменять местами или иногда
      //expect(response.body.accessToken).not.toBe(accessToken);
      console.log(' refreshToken');
      console.log(refreshToken);
      accessToken = response.body.accessToken;
      const refreshTokenNew = await helperTest.getRefreshTokenInCookie(
        response.headers['set-cookie'],
      );
      expect(refreshTokenNew).not.toBe(false);
      console.log(' refreshTokenNEW');
      console.log(refreshTokenNew);
      expect(refreshTokenNew).not.toBe(refreshToken);
      refreshToken = refreshTokenNew;
      refreshTokenCookies = response.headers['set-cookie'];
    });
    it('/logout', async () => {
      const response = await request(server)
        .post(endpoints.authController.logout)
        .set('Cookie', [refreshTokenCookies]);
      expect(response.status).toBe(204);
      const checkLogoutResponse = await request(server)
        .post(endpoints.authController.refreshToken)
        .set('Cookie', [refreshTokenCookies]);
      console.log(response.text);
      expect(checkLogoutResponse.status).toBe(401);
    });
  });
});
