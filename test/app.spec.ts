import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { appSetting } from '../src/appSetting';
import { CreateBlogDTO } from '../src/DTO';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController', () => {
  let app: INestApplication;
  let httpServer;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    appSetting(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Blog', () => {
    it('should return Create Blog"', () => {
      const newBlog: CreateBlogDTO = {
        name: 'string',
        description: 'string',
        websiteUrl: 'string',
      };

      request(httpServer)
        .post('/blogs')
        .send(newBlog)
        .expect(HttpStatus.CREATED);
    });
  });
});

// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//
//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });
//
//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/')
//       .expect(200)
//       .expect('Hello World!');
//   });
// });
