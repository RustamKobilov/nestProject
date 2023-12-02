import {
  Controller,
  Get,
  Injectable,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { Response } from 'express';
import { QuizService } from './quizService';
import { PlayerInformation } from './Entitys/GameEntity';

@Injectable()
@Controller('/pair-game-quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(BearerGuard)
  @Post('/pairs/connection')
  async connectionGame(@Res() res: Response, @Req() req) {
    const player: PlayerInformation = {
      playerId: req.user.id,
      playerLogin: req.user.login,
    };
    const game = await this.quizService.connectionGame(player);
    return res.status(201).send(game);
  }
  // @UseGuards(BearerGuard)
  // @Get('/pairs/my-currents')
  // async getGameNotFinished(@Res() res: Response, @Req() req) {
  //   const game = await this.quizService.getGameNotFinished(req.user.id);
  //   return res.status(201).send(game);
  // }
}
