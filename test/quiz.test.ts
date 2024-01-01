import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetting } from '../src/appSetting';
import { HelperTest } from './helperTest';
import request from 'supertest';
import { endpoints } from './routing';
import {
  AnswerViewModel,
  QuestionViewModel,
  SaQuestionViewModel,
  UpdatePublishedQuestionDTO,
} from '../src/Qustions/questionDTO';
import { outputModel } from '../src/DTO';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayerViewModel,
  StaticViewModel,
  TopPlayerViewModel,
} from '../src/Game/gameDTO';
import { gameStatusesEnum } from '../src/Qustions/questionEnum';

describe('test App', () => {
  jest.setTimeout(100 * 1000);

  let app: INestApplication;
  let server;
  let dataBaseServer;
  let helperTest;
  let basicAuthorization;
  let user1Test;
  let user2Test;
  let refreshTokenUser1Test;
  let refreshTokenCookiesUser1Test;
  let refreshTokenUser2Test;
  let refreshTokenCookiesUser2Test;
  // let blogTest;
  // let accessToken;
  let inputQuestionTest;
  let bodyInputQuestionTest;
  let gameId;

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
      inputQuestionTest = await helperTest.createTestingQuestion();
      const response = await request(server)
        .post(endpoints.admin + '/quiz/questions')
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
        updatedAt: null,
      });
      bodyInputQuestionTest = response.body;
    });
    it('create falseQuestion for Admin', async () => {
      const inputQuestionTest = {
        correctAnswers: [5, 7],
        body: 'falseMin',
      };
      const response = await request(server)
        .post(endpoints.admin + '/quiz/questions')
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
    it('get Question for Admin', async () => {
      const response = await request(server)
        .get(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(<outputModel<SaQuestionViewModel>>{
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          <SaQuestionViewModel>{
            id: expect.any(String),
            body: inputQuestionTest.body,
            correctAnswers: inputQuestionTest.correctAnswers,
            published: false,
            createdAt: expect.any(String),
            updatedAt: null,
          },
        ],
      });
    });
    it('update Question for Admin', async () => {
      const updateQuestion = await helperTest.createTestingQuestion();
      const responseUpdate = await request(server)
        .put(endpoints.admin + '/quiz/questions/' + bodyInputQuestionTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        })
        .send(updateQuestion);
      expect(responseUpdate.status).toBe(204);
      const response = await request(server)
        .get(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          <SaQuestionViewModel>{
            id: expect.any(String),
            body: updateQuestion.body,
            correctAnswers: updateQuestion.correctAnswers,
            published: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      });
    });
    it('delete Question for Admin', async () => {
      const responseDelete = await request(server)
        .delete(endpoints.admin + '/quiz/questions/' + bodyInputQuestionTest.id)
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(responseDelete.status).toBe(204);
      const response = await request(server)
        .get(endpoints.admin + '/quiz/questions')
        .auth(basicAuthorization.username, basicAuthorization.password, {
          type: 'basic',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(<outputModel<SaQuestionViewModel>>{
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });
  describe('gameQuiz ', () => {
    it('create Question for Admin', async () => {
      // const deleteBase = await request(server).delete(
      //   endpoints.testingController.allData,
      // );
      for (let x = 0; x < 5; x++) {
        inputQuestionTest = await helperTest.createTestingQuestion();
        const createResponse = await request(server)
          .post(endpoints.admin + '/quiz/questions')
          .auth(basicAuthorization.username, basicAuthorization.password, {
            type: 'basic',
          })
          .send(inputQuestionTest);
        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toBeDefined();
        const updateResponse = await request(server)
          .put(
            endpoints.admin +
              '/quiz/questions' +
              '/' +
              createResponse.body.id +
              '/publish',
          )
          .auth(basicAuthorization.username, basicAuthorization.password, {
            type: 'basic',
          })
          .send(<UpdatePublishedQuestionDTO>{
            published: true,
          });
        expect(updateResponse.status).toBe(204);
      }
    });
    it('create Users for Admin and Login', async () => {
      user1Test = await helperTest.createAndLoginTestingUser();
      refreshTokenUser1Test = user1Test.refreshToken;
      ///user2
      user2Test = await helperTest.createAndLoginTestingUser();
      refreshTokenUser2Test = user2Test.refreshToken;
    });
    it('connection game for player1', async () => {
      await helperTest.connectionQuizGameForUser1(
        refreshTokenUser1Test,
        user1Test.id,
        user1Test.login,
      );

      const responseConnectionUser1TestAttempt2 = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenUser1Test);

      expect(responseConnectionUser1TestAttempt2.status).toBe(403);
    });
    it('connection game for player2', async () => {
      gameId = await helperTest.connectionQuizGameForUser2(
        refreshTokenUser2Test,
        user2Test.id,
        user2Test.login,
      );
      const responseConnectionUser2TestAttempt2 = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);

      expect(responseConnectionUser2TestAttempt2.status).toBe(403);
    });
    it('post answer for player1 and player2', async () => {
      await helperTest.createAnswerInGameFor2User(
        refreshTokenUser1Test,
        1,
        refreshTokenUser2Test,
        5,
      );
    });
    it('get game for player by id, after game', async () => {
      const response = await request(server)
        .get(endpoints.gameQuiz + '/pairs/' + gameId)
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(<GamePairViewModel>{
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array<AnswerViewModel>),
          player: {
            id: expect.any(String),
            login: expect.any(String),
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: expect.any(Array<AnswerViewModel>),
          player: {
            id: expect.any(String),
            login: expect.any(String),
          },
          score: 5,
        },
        questions: expect.any(Array<QuestionViewModel>),
        status: gameStatusesEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });
    it('connection game for player1', async () => {
      await helperTest.connectionQuizGameForUser1(
        refreshTokenUser1Test,
        user1Test.id,
        user1Test.login,
      );

      const responseConnectionUser1TestAttempt2 = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenUser1Test);

      expect(responseConnectionUser1TestAttempt2.status).toBe(403);
    });
    it('connection game for player2', async () => {
      gameId = await helperTest.connectionQuizGameForUser2(
        refreshTokenUser2Test,
        user2Test.id,
        user2Test.login,
      );
      const responseConnectionUser2TestAttempt2 = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);

      expect(responseConnectionUser2TestAttempt2.status).toBe(403);
    });
    it('post answer for player1 and player2, player1 all no correct, but fast answer', async () => {
      await helperTest.createAnswerInGameFor2User(
        refreshTokenUser1Test,
        0,
        refreshTokenUser2Test,
        1,
      );
    });
    it('get game for player by id, after game false answer, but NoCorrect', async () => {
      const response = await request(server)
        .get(endpoints.gameQuiz + '/pairs/' + gameId)
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(<GamePairViewModel>{
        id: gameId,
        firstPlayerProgress: {
          answers: expect.any(Array<AnswerViewModel>),
          player: {
            id: expect.any(String),
            login: expect.any(String),
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: expect.any(Array<AnswerViewModel>),
          player: {
            id: expect.any(String),
            login: expect.any(String),
          },
          score: 1,
        },
        questions: expect.any(Array<QuestionViewModel>),
        status: gameStatusesEnum.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
      //TODO тест топа после двух тестов 2 выше
    });

    it('gat statisticGame for User', async () => {
      const responseGetStaticUser1 = await request(server)
        .get(endpoints.gameQuiz + '/users/my-statistic')
        .set('Authorization', 'Bearer ' + refreshTokenUser1Test);
      expect(responseGetStaticUser1.status).toBe(200);
      //gameUser1 /(1) (0)/ gameUser2 /5 1/ = > User1 2 User2 6
      expect(responseGetStaticUser1.body).toEqual(<StaticViewModel>{
        avgScores: 1,
        gamesCount: 2,
        drawsCount: 0,
        winsCount: 0,
        sumScore: 2,
        lossesCount: 2,
      });
      const responseGetStaticUser2 = await request(server)
        .get(endpoints.gameQuiz + '/users/my-statistic')
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);
      expect(responseGetStaticUser2.status).toBe(200);
      expect(responseGetStaticUser2.body).toEqual(<StaticViewModel>{
        avgScores: 3,
        gamesCount: 2,
        drawsCount: 0,
        winsCount: 2,
        sumScore: 6,
        lossesCount: 0,
      });
    });
    it('connection game for player1', async () => {
      await helperTest.connectionQuizGameForUser1(
        refreshTokenUser1Test,
        user1Test.id,
        user1Test.login,
      );

      const responseConnectionUser1TestAttempt2 = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenUser1Test);

      expect(responseConnectionUser1TestAttempt2.status).toBe(403);
    });
    it('connection game for player2', async () => {
      gameId = await helperTest.connectionQuizGameForUser2(
        refreshTokenUser2Test,
        user2Test.id,
        user2Test.login,
      );
      const responseConnectionUser2TestAttempt2 = await request(server)
        .post(endpoints.gameQuiz + '/pairs/connection')
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);

      expect(responseConnectionUser2TestAttempt2.status).toBe(403);
    });
    it('post answer for player1 and player2, player1 all  correct, draws check', async () => {
      await helperTest.createAnswerInGameFor2User(
        refreshTokenUser2Test,
        1,
        refreshTokenUser1Test,
        2,
      );
    });
    it('gat statisticGame for User', async () => {
      const responseGetStaticUser1 = await request(server)
        .get(endpoints.gameQuiz + '/users/my-statistic')
        .set('Authorization', 'Bearer ' + refreshTokenUser1Test);
      expect(responseGetStaticUser1.status).toBe(200);
      //gameUser1 /(1) (0) 2/ gameUser2 /5 1 (1)/ = > User1 4 User2 8
      expect(responseGetStaticUser1.body).toEqual(<StaticViewModel>{
        avgScores: 1.33,
        gamesCount: 3,
        drawsCount: 1,
        winsCount: 0,
        sumScore: 4,
        lossesCount: 2,
      });
      const responseGetStaticUser2 = await request(server)
        .get(endpoints.gameQuiz + '/users/my-statistic')
        .set('Authorization', 'Bearer ' + refreshTokenUser2Test);
      expect(responseGetStaticUser2.status).toBe(200);
      expect(responseGetStaticUser2.body).toEqual(<StaticViewModel>{
        avgScores: 2.67,
        gamesCount: 3,
        drawsCount: 1,
        winsCount: 2,
        sumScore: 8,
        lossesCount: 0,
      });
    });
    it('gat topUser games', async () => {
      const responseGetTop = await request(server).get(
        endpoints.gameQuiz + '/users/top',
      );
      expect(responseGetTop.status).toBe(200);
      console.log(responseGetTop.body.items[1]);
      expect(responseGetTop.body).toEqual(<outputModel<TopPlayerViewModel>>{
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array<TopPlayerViewModel>),
      });
      //default: avgScores desc,sumScore desc
      //expect(responseGetTop.body.items[1].player.id).toEqual(user2Test.id);
      //TODO просто string lfkmit cnhjrb gbitv '/users/top'
      const responseGetTopPagination = await request(server)
        .get(endpoints.gameQuiz + '/users/top')
        .set('paginate', 'lossesCount desc,drawsCount desc');
      expect(responseGetTopPagination.status).toBe(200);
      console.log(responseGetTopPagination.body);
      // expect(responseGetTopPagination.body.items[1].player.id).toEqual(
      //   user1Test.id,
      // );
    });
  });
});
