import { QuestionsRepository } from './questionsRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateQuestionDTO,
  GamePairViewModel,
  QuestionsPaginationDTO,
  QuestionViewModel,
} from './questionDTO';
import {
  GameEntity,
  PlayerEntity,
  QuestionEntity,
} from './Entitys/QuestionEntity';
import { randomUUID } from 'crypto';
import { mapQuestions } from './mapQuestions';
import { helper } from '../helper';
import { isUUID } from 'class-validator';
import { gameStatusesEnum } from './questionEnum';
import { mapObject } from '../mapObject';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async createQuestion(
    createQuestionDTO: CreateQuestionDTO,
  ): Promise<QuestionViewModel> {
    const question: QuestionEntity = {
      id: randomUUID(),
      body: createQuestionDTO.body,
      correctAnswers: createQuestionDTO.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: 'no update',
    };
    await this.questionsRepository.createQuestion(question);
    const questionViewModel = mapQuestions.mapQuestionsViewModel([question])[0];
    return questionViewModel;
  }

  async getQuestions(questionPaginationDTO: QuestionsPaginationDTO) {
    const pagination = helper.getQuestionPaginationDTO(questionPaginationDTO);
    console.log(pagination);
    return this.questionsRepository.getQuestions(pagination);
  }

  async deleteQuestions(questionId: string): Promise<boolean> {
    if (isUUID(questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(questionId);
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    return this.questionsRepository.deleteQuestion(questionId);
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDTO: CreateQuestionDTO,
  ) {
    if (isUUID(questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(questionId);
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const updateQuestion = this.questionsRepository.updateQuestion(
      questionId,
      updateQuestionDTO,
    );
    if (!updateQuestion) {
      throw new NotFoundException(
        'question ne obnovilsya, questionService ,update',
      );
    }
    return true;
  }

  async updatePublishQuestion(questionId: string, published: boolean) {
    if (isUUID(questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(questionId);
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const updateQuestion = this.questionsRepository.updatePublishQuestion(
      questionId,
      published,
    );
    if (!updateQuestion) {
      throw new NotFoundException(
        'question ne obnovilsya, questionService ,update',
      );
    }
    return true;
  }

  private async createPlayerAwaitGame(user) {
    const player: PlayerEntity = {
      idGame: randomUUID(),
      playerId: user.id,
      playerLogin: user.login,
      playerScore: 0,
      playerAnswers: [],
      status: gameStatusesEnum.PendingSecondPlayer,
      playerPairCreatedDate: new Date().toISOString(),
    };
    await this.questionsRepository.createPlayer(player);
    const playerGamePairViewModelPendingSecondPlayer =
      mapQuestions.mapGamePairViewModelPendingSecondPlayer(player);
    return playerGamePairViewModelPendingSecondPlayer;
  }
  private async createGame(
    playerAwaitGame: PlayerEntity,
    player: PlayerEntity,
  ) {
    const game: GameEntity = {
      id: playerAwaitGame.idGame,
      status: gameStatusesEnum.Active,
      pairCreatedDate: playerAwaitGame.playerPairCreatedDate,
      startGameDate: new Date().toISOString(),
      finishGameDate: new Date().toISOString(),
    };
    await this.questionsRepository.createGame(game);
    //const questions = await this.questionsRepository.
    //const gameViewModel:GamePairViewModel = mapObject.mapGameViewModel(playerAwaitGame,player,game,questions)
    return true;
  }
  async connectionGame(user) {
    const getPlayerAwaitGame =
      await this.questionsRepository.getPlayerAwaitGame();
    if (getPlayerAwaitGame.length < 1) {
      console.log('CreatePlayerAwaitGame');
      return this.createPlayerAwaitGame(user);
    }
    const player: PlayerEntity = {
      idGame: getPlayerAwaitGame[0].idGame,
      playerId: user.id,
      playerLogin: user.login,
      playerScore: 0,
      playerAnswers: [],
      status: gameStatusesEnum.Active,
      playerPairCreatedDate: new Date().toISOString(),
    };
    await this.questionsRepository.createPlayer(player);
    const game = await this.createGame(getPlayerAwaitGame[0], player);
    console.log('pereskochili');
    console.log(getPlayerAwaitGame);
    return game;
  }
}
