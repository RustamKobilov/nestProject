import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { appSetting } from '../appSetting';
import { BlogController } from './Blog/blogController';
import { BlogService } from './Blog/blogService';
import { BlogRepository } from './Blog/blogRepository';
import * as request from 'supertest';

describe('AppController', () => {
  let app: INestApplication;
  let httpServer;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [BlogService, BlogRepository],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetting(app);
    await app.init();
    httpServer.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Blog', () => {
    it('should return Create Blog"', () => {
      request(httpServer).post('/blogs').expect(HttpStatus.CREATED);
    });
  });
});
