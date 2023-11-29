import { QuestionsService } from './questionsService';
import {
  Controller,
  Get,
  Injectable,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { Response } from 'express';
import { QuestionsPaginationDTO } from './questionDTO';

@Injectable()
@Controller('/pair-game-quiz')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(BearerGuard)
  @Post('/pairs/connection')
  async connectionGame(@Res() res: Response, @Req() req) {
    const game = await this.questionsService.connectionGame(req.user);
    return res.status(201).send(game);
  }
  @UseGuards(BearerGuard)
  @Get('/pairs/my-currents')
  async getGameNotFinished(@Res() res: Response, @Req() req) {
    const game = await this.questionsService.getGameNotFinished(req.user.id);
    return res.status(201).send(game);
  }
}
