import { QuestionsService } from './questionsService';
import {
  Controller,
  Injectable,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { Response } from 'express';

@Injectable()
@Controller('sa/quiz')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(BearerGuard)
  @Post('/pairs/connection')
  async connectionGame(@Res() res: Response, @Req() req) {
    const output = await this.questionsService.connectionGame(req.user);

    //check game for awaiting user
    return res.status(201).send(output);
  }
}
