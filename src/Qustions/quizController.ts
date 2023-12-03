import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { Response } from 'express';
import { QuizService } from './quizService';
import { PlayerInformation } from './Entitys/GameEntity';
import {
  AnswerViewModel,
  CreateAnswerDTO,
  CreateQuestionDTO,
} from './questionDTO';

@Injectable()
@Controller('/pair-game-quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(BearerGuard)
  @Post('/pairs/connection')
  async createConnection(@Res() res: Response, @Req() req) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const game = await this.quizService.connectionGame(player);
    return res.status(201).send(game);
  }
  @UseGuards(BearerGuard)
  @Post('/pairs/my-currents/answers')
  async createAnswer(
    @Res() res: Response,
    @Req() req,
    @Body() createAnswerDTO: CreateAnswerDTO,
  ) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const answerViewModel = await this.quizService.createAnswer(
      player,
      createAnswerDTO,
    );
    return res.status(201).send(answerViewModel);
  }
  @UseGuards(BearerGuard)
  @Get('/pairs/my-currents')
  async getGameNotFinished(@Res() res: Response, @Req() req) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const game = await this.quizService.getGameNotFinished(player);
    return res.status(201).send(game);
  }
  @UseGuards(BearerGuard)
  @Get('/pairs/:id')
  async getGame(@Res() res: Response, @Req() req, @Param('id') gameId: string) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const game = await this.quizService.getGame(gameId, player);
    return res.status(201).send(game);
  }
}
