import { QuestionsRepository } from './questionsRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateQuestionDTO,
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayer,
  QuestionsPaginationDTO,
  SaQuestionViewModel,
} from './questionDTO';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { randomUUID } from 'crypto';
import { mapKuiz } from './mapKuiz';
import { helper } from '../helper';
import { isUUID } from 'class-validator';
import { gameStatusesEnum } from './questionEnum';
import { PlayerEntityType } from './Entitys/PlayerEntity';
import { GameEntityType } from './Entitys/GameEntity';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async createQuestion(
    createQuestionDTO: CreateQuestionDTO,
  ): Promise<SaQuestionViewModel> {
    const question: QuestionEntity = {
      id: randomUUID(),
      body: createQuestionDTO.body,
      correctAnswers: createQuestionDTO.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: 'no update',
    };
    await this.questionsRepository.createQuestion(question);
    const questionViewModel = mapKuiz.mapSaQuestionsViewModel([question])[0];
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
    const player: PlayerEntityType = {
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
      mapKuiz.mapGamePairViewModelPendingSecondPlayer(player);
    return playerGamePairViewModelPendingSecondPlayer;
  }
  private async createGame(
    playerAwaitGame: PlayerEntityType,
    player: PlayerEntityType,
  ): Promise<GamePairViewModel> {
    const game: GameEntityType = {
      id: playerAwaitGame.idGame,
      status: gameStatusesEnum.Active,
      pairCreatedDate: playerAwaitGame.playerPairCreatedDate,
      startGameDate: new Date().toISOString(),
      finishGameDate: null,
    };
    await this.questionsRepository.createGame(game);
    const questionsViewModel =
      await this.questionsRepository.getRandomQuestionsAmount();
    const gameViewModel: GamePairViewModel = mapKuiz.mapGameViewModel(
      playerAwaitGame,
      player,
      game,
      questionsViewModel,
    );
    return gameViewModel;
  }
  async connectionGame(
    user,
  ): Promise<GamePairViewModelPendingSecondPlayer | GamePairViewModel> {
    const getPlayerAwaitGame =
      await this.questionsRepository.getPlayerAwaitGame();
    console.log('await Player');
    console.log(getPlayerAwaitGame);
    if (getPlayerAwaitGame.length < 1) {
      console.log('CreatePlayerAwaitGame');
      return this.createPlayerAwaitGame(user);
    }
    const player: PlayerEntityType = {
      idGame: getPlayerAwaitGame[0].idGame,
      playerId: user.id,
      playerLogin: user.login,
      playerScore: 0,
      playerAnswers: [],
      status: gameStatusesEnum.Active,
      playerPairCreatedDate: new Date().toISOString(),
    };
    console.log('model');
    console.log(player);
    await this.questionsRepository.createPlayer(player);
    console.log('create Player');
    console.log(player);
    const game = await this.createGame(getPlayerAwaitGame[0], player);
    const updateStatusAwaitUser =
      await this.questionsRepository.updatePlayerStatus(
        getPlayerAwaitGame[0].playerId,
      );
    if (!updateStatusAwaitUser) {
      throw new NotFoundException(
        'awaitUser not found for update, questionService ,connectionGame',
      );
    }
    return game;
  }
  async getGameNotFinished(userId: string) /*Promise<GamePairViewModel>*/ {
    const game = await this.questionsRepository.getGameNotFinished(userId);
    if (!game) {
      throw new NotFoundException(
        'game not found fr user, questionService ,getGameNotFinished',
      );
    }
    return game;
  }
}
