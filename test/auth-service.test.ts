import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('integration test for AuthService', () => {
  jest.setTimeout(60 * 1000);

  let app: INestApplication;
  let server;

  beforeAll(async () => {
    const mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    console.log(mongoUri);
    process.env['MONGO_URI_CLUSTER'] = mongoUri;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await moduleFixture.createNestApplication();
    app = appSetting(app);
    await app.init();
    server = app.getHttpServer();
  });

  describe('createUser', () => {
    it('should return', async () => {
      const response = await request(server).get('/users');
      //.auth(user.accessToken, { type: 'bearer' });
      console.log(response.body);
    });
  });
});
