import { RepositoryTesting } from '../src/Testing/repositoryTesting';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import { ConfigService } from '@nestjs/config';

export class HelperTest {
  constructor(
    private repositoryTesting: RepositoryTesting,
    private configService: ConfigService,
  ) {}
  async startMongoMemoryServer() {
    const mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    this.configService.get<string>('MONGO_URI_CLUSTER') = mongoUri;
    return true;
  }
  async startNestAppTest() {
    let app: INestApplication;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await moduleFixture.createNestApplication();
    app = appSetting(app);
    await app.init();
    const server = app.getHttpServer();
    return server;
  }
  async deleteModelInBase() {
    return await this.repositoryTesting.deleteAll();
  }
}
