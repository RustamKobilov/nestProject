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
import { PlayerInformation } from './Game.Entity';
import { CreateAnswerDTO } from '../Qustions/questionDTO';
import { PaginationSqlDTO } from '../DTO';
import { PaginationGetTopDTO } from './gameDTO';
import { addSeconds } from 'date-fns';
import { CommandBus } from '@nestjs/cqrs';
import { GetQuizGameUseCaseCommand } from './use-case/get-quiz-game-use-case';
import { GetGameNotFinishedUseCaseCommand } from './use-case/get-game-not-finished-use-case';

@Injectable()
@Controller('/pair-game-quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly commandBus: CommandBus,
  ) {}

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
    const game = await this.commandBus.execute(
      new GetGameNotFinishedUseCaseCommand(player),
    );
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
    const game = await this.commandBus.execute(
      new GetQuizGameUseCaseCommand(gameId, player),
    );
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
  @Get('/users/tops')
  async getTopz(
    @Res() res: Response,
    @Req() req,
    @Query() topPaginationDTO: PaginationGetTopDTO,
  ) {
    const date1 = new Date().toISOString();
    const dateParse1 = Date.parse(new Date().toISOString());
    const date2 = new Date().toISOString();
    const dateParse2 = Date.parse(new Date().toISOString());
    const dateAddSecond = addSeconds(dateParse2, 10).toISOString();
    console.log(date1);
    console.log(dateParse1);
    console.log(date2);
    console.log(dateParse2);
    console.log(dateAddSecond);
    // console.log(date1);
    // console.log(new Date().toISOString());
    //
    // const date2 = Date.parse(
    //   new Date(new Date(new Date().getSeconds() + 10)).toISOString(),
    // );
    // console.log(date1);
    // console.log(date2);
    //const result = date2 - date1;

    return res.status(200).send('result');
  }
}