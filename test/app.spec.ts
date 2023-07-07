import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { appSetting } from '../src/appSetting';
import { CreateBlogDTO, CreatePostByBlogDTO, CreatePostDTO } from '../src/DTO';
import request from 'supertest';
import { AppModule } from '../src/app.module';

async function creatManyBlog(
  httpServer: string,
  colBlog: number,
  searchName?: string,
) {
  const insertedBlogs = [];
  for (let x = 0; x < colBlog; x++) {
    const newBlog: CreateBlogDTO = {
      name: 'string',
      description: 'string',
      websiteUrl: 'https://bitrix24.by/koba',
    };
    if (searchName && x == colBlog - 1) {
      newBlog.name = searchName!;
    }
    const responseBlog = await request(httpServer)
      .post('/blogs')
      .send(newBlog)
      .expect(HttpStatus.CREATED);
  }
}

async function creatManyPosts(
  httpServer: string,
  blogId: string,
  colBlog: number,
  searchName?: string,
) {
  for (let x = 0; x < colBlog; x++) {
    const newPost: CreatePostDTO = {
      title: 'postMany',
      shortDescription: 'postMany',
      content: 'postMany',
      blogId: blogId,
    };
    // if (searchName && x == colBlog - 1) {
    //   newPost.name = searchName!;
    // }
    console.log(blogId);
    const responsePost = await request(httpServer)
      .post('/posts/')
      .send(newPost)
      .expect(HttpStatus.CREATED);
  }
}

describe('Blog', () => {
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

  let viewModelBlog;
  it('should return Create Blog"', async () => {
    await request(httpServer).delete('/testing/all-data');

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
    await creatManyBlog(httpServer, checkBlogAdd);

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

describe('Post', () => {
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

  let viewModelBlog;
  let viewModelPost;

  it('should Create Post', async () => {
    await request(httpServer).delete('/testing/all-data');

    const newPost: CreatePostDTO = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: 'string',
    };
    const newBlog: CreateBlogDTO = {
      name: 'string',
      description: 'string',
      websiteUrl: 'https://bitrix24.by/koba',
    };

    const responseBlog = await request(httpServer)
      .post('/blogs/')
      .send(newBlog)
      .expect(HttpStatus.CREATED);

    viewModelBlog = responseBlog.body;
    newPost.blogId = viewModelBlog.id;

    const responsePost = await request(httpServer)
      .post('/posts/')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    expect(responsePost.body).toEqual({
      id: expect.any(String),
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: viewModelBlog.id,
      blogName: viewModelBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.anything(),
    });
    viewModelPost = responsePost.body;
  });
  it('should get Post', async () => {
    const responsePost = await request(httpServer)
      .get('/posts/' + viewModelPost.id)
      .expect(HttpStatus.OK);

    expect(responsePost.body).toEqual(viewModelPost);
  });
  it('should update Post', async () => {
    const updatePost: CreatePostDTO = {
      title: 'stringUpdate',
      shortDescription: 'stringUpdate',
      content: 'stringUpdate',
      blogId: viewModelBlog.id,
    };
    await request(httpServer)
      .put('/posts/' + viewModelPost.id)
      .send(updatePost)
      .expect(HttpStatus.NO_CONTENT);

    const responsePost = await request(httpServer)
      .get('/posts/' + viewModelPost.id)
      .expect(HttpStatus.OK);
    expect(responsePost.body).toEqual({
      id: viewModelPost.id,
      title: updatePost.title,
      shortDescription: updatePost.shortDescription,
      content: updatePost.content,
      blogId: viewModelBlog.id,
      blogName: viewModelBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.anything(),
    });
  });
  it('should delete Blog"', async () => {
    await request(httpServer)
      .delete('/posts/' + viewModelPost.id)
      .expect(HttpStatus.NO_CONTENT);

    const responseBlogGet = await request(httpServer)
      .get('/posts/' + viewModelPost.id)
      .expect(HttpStatus.NOT_FOUND);
  });
  it('should getPosts', async () => {
    const checkPostAdd = 4;
    await creatManyPosts(httpServer, viewModelBlog.id, checkPostAdd);

    const resultGetRequest = await request(httpServer)
      .get('/posts/')
      .expect(HttpStatus.OK);
    const checkPagesCount = Math.ceil(checkPostAdd / 10);
    expect(resultGetRequest.body).toEqual({
      pagesCount: checkPagesCount,
      page: 1,
      pageSize: 10,
      totalCount: checkPostAdd,
      items: expect.anything(),
    });
  });
});

describe('Posts together Blogs', () => {
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

  let viewModelBlog;
  let viewModelPost;

  it('should return Create Blog"', async () => {
    await request(httpServer).delete('/testing/all-data');

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
  });

  it('should return Create Post by blog"', async () => {
    const newPostbyBlog: CreatePostByBlogDTO = {
      title: 'stringByBlog',
      shortDescription: 'stringByBlog',
      content: 'stringByBlog',
    };
    const responseBlog = await request(httpServer)
      .post('/blogs/' + viewModelBlog.id + '/posts/')
      .send(newPostbyBlog)
      .expect(HttpStatus.CREATED);
    viewModelPost = responseBlog.body;
  });
  it('should get Post', async () => {
    const responsePost = await request(httpServer)
      .get('/posts/' + viewModelPost.id)
      .expect(HttpStatus.OK);

    expect(responsePost.body).toEqual(viewModelPost);
  });
  it('should getPosts by Blog', async () => {
    const newBlogDif: CreateBlogDTO = {
      name: 'stringDif',
      description: 'stringDif',
      websiteUrl: 'https://bitrix24.by/kobaDif',
    };

    const responseBlog = await request(httpServer)
      .post('/blogs')
      .send(newBlogDif)
      .expect(HttpStatus.CREATED);
    const viewModelBlogDif = responseBlog.body;

    const checkPostAdd = 4;
    await creatManyPosts(httpServer, viewModelBlogDif.id, checkPostAdd);

    const resultGetRequest = await request(httpServer)
      .get('/blogs/' + viewModelBlog.id + '/posts/')
      .expect(HttpStatus.OK);
    const checkPagesCount = Math.ceil(1 / 10);
    expect(resultGetRequest.body).toEqual({
      pagesCount: checkPagesCount,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [viewModelPost],
    });

    const resultGetRequestDif = await request(httpServer)
      .get('/blogs/' + viewModelBlogDif.id + '/posts/')
      .expect(HttpStatus.OK);
    const checkPagesCountDif = Math.ceil(checkPostAdd / 10);
    expect(resultGetRequestDif.body).toEqual({
      pagesCount: checkPagesCountDif,
      page: 1,
      pageSize: 10,
      totalCount: checkPostAdd,
      items: expect.anything(),
    });
  });
});
