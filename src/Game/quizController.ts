import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { Response } from 'express';
import { QuizService } from './quizService';
import { PlayerInformation } from './GameEntity';
import { CreateAnswerDTO } from '../Qustions/questionDTO';
import { PaginationSqlDTO } from '../DTO';
import { PaginationGetTopDTO } from './gameDTO';
import { PlayerEntity } from './PlayerEntity';

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
    return res.status(200).send(game);
  }
  @UseGuards(BearerGuard)
  @Post('/pairs/my-current/answers')
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

    return res.status(200).send(answerViewModel);
  }
  @UseGuards(BearerGuard)
  @Get('/pairs/my-current')
  async getGameNotFinished(@Res() res: Response, @Req() req) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const game = await this.quizService.getGameNotFinished(player);
    return res.status(200).send(game);
  }
  @UseGuards(BearerGuard)
  @Get('/pairs/my')
  async getGames(
    @Res() res: Response,
    @Req() req,
    @Query() gamesPaginationDTO: PaginationSqlDTO,
  ) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const games = await this.quizService.getGames(player, gamesPaginationDTO);
    return res.status(200).send(games);
  }
  @UseGuards(BearerGuard)
  @Get('/pairs/:id')
  async getGame(@Res() res: Response, @Req() req, @Param('id') gameId: string) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const game = await this.quizService.getGame(gameId, player);
    return res.status(200).send(game);
  }
  @UseGuards(BearerGuard)
  @Get('/users/my-statistic')
  async getStaticGameUser(@Res() res: Response, @Req() req) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const statisticViewModel = await this.quizService.getStatisticGameUser(
      player,
    );
    return res.status(200).send(statisticViewModel);
  }

  @Get('/users/top')
  async getTop(
    @Res() res: Response,
    @Req() req,
    @Query() topPaginationDTO: PaginationGetTopDTO,
  ) {
    const top = await this.quizService.getTopUsersStatistic(topPaginationDTO);

    return res.status(200).send(top);
  }
}
