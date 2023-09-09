import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import request from 'supertest';
let app: INestApplication;
let server;
describe('integration test for AuthService', () => {
  beforeEach(async () => {
    const mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    process.env['MONGO_URI'] = mongoUri;
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
