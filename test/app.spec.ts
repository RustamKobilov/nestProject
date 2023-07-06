import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { appSetting } from '../src/appSetting';
import { CreateBlogDTO } from '../src/DTO';
import request from 'supertest';
import { AppModule } from '../src/app.module';
let httpServer;
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
    const blogId = null;
    let viewModelBlog;
    it('should return Create Blog"', async () => {
      const newBlog: CreateBlogDTO = {
        name: 'string',
        description: 'string',
        websiteUrl: 'https://bitrix24.by/koba',
      };

      const responseBlog = await request(httpServer)
        .post('/blogs')
        .send(newBlog)
        .expect(HttpStatus.CREATED);

      expect(responseBlog.body).toEqual({
        id: expect.any(String),
        name: newBlog.name,
        description: newBlog.description,
        websiteUrl: newBlog.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });
      viewModelBlog = responseBlog.body;
      console.log(viewModelBlog);
    });
    it('should get Blog"', async () => {
      const responseBlog = await request(httpServer)
        .get('/blogs/' + viewModelBlog.id)
        .expect(HttpStatus.OK);
      expect(responseBlog.body).toEqual(viewModelBlog);
    });

    it('should Update Blog"', async () => {
      const newBlogUpdate: CreateBlogDTO = {
        name: 'stringUpdate',
        description: 'Update',
        websiteUrl: 'https://bitrix24.by/kobaUpdate',
      };
      await request(httpServer)
        .put('/blogs/' + viewModelBlog.id)
        .send(newBlogUpdate)
        .expect(HttpStatus.NO_CONTENT);

      const responseBlogGet = await request(httpServer)
        .get('/blogs/' + viewModelBlog.id)
        .expect(HttpStatus.OK);
      expect(responseBlogGet.body).toEqual({
        id: expect.any(String),
        name: newBlogUpdate.name,
        description: newBlogUpdate.description,
        websiteUrl: newBlogUpdate.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });
    });
    it('should delete Blog"', async () => {
      await request(httpServer)
        .delete('/blogs/' + viewModelBlog.id)
        .expect(HttpStatus.NO_CONTENT);

      const responseBlogGet = await request(httpServer)
        .get('/blogs/' + viewModelBlog.id)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should getBlogs', async () => {
      const checkBlogAdd = 4;
      await creatManyBlog(checkBlogAdd);

      const resultGetRequest = await request(httpServer)
        .get('/blogs/')
        .expect(HttpStatus.OK);
      const checkPagesCount = Math.ceil(checkBlogAdd / 10);
      expect(resultGetRequest.body).toEqual({
        pagesCount: checkPagesCount,
        page: 1,
        pageSize: 10,
        totalCount: checkBlogAdd,
        items: expect.anything(),
      });
    });
  });
});

async function creatManyBlog(colBlog: number, searchName?: string) {
  const insertedBlogs = [];
  for (let x = 0; x < colBlog; x++) {
    const blogCheckManyAdd = {
      name: 'checking blog',
      description: 'checking description',
      websiteUrl: 'https://api-swagger.it-incubator.ru/checking',
    };
    if (searchName && x == colBlog - 1) {
      blogCheckManyAdd.name = searchName!;
    }
    const CreateBlogResponse = await request(httpServer)
      .post(
        '/blogs/',
      ) /*.set(BasicAuthorized.authorization, BasicAuthorized.password).*/
      .send(blogCheckManyAdd)
      .expect(201);
    insertedBlogs.push(CreateBlogResponse);
  }
  await Promise.all(insertedBlogs);
}
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
