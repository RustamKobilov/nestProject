import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './commentService';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { IdenteficationUserGuard } from '../auth/Guard/identeficationUserGuard';
import { CreateCommentDto, UpdateLikeStatusDto } from '../DTO';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentForUserUseCaseCommand } from './use-cases/get-comment-for-user-use-case';
import { UpdateCommentUseCaseCommand } from './use-cases/update-comment-use-case';
import { DeleteCommentUseCaseCommand } from './use-cases/delete-comment-use-case';
import { UpdateLikeStatusCommentUseCaseCommand } from './use-cases/update-like-status-comment-use-case';

@SkipThrottle()
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(IdenteficationUserGuard)
  @Get('/:id')
  async getComment(@Param('id') commentId: string, @Res() res, @Req() req) {
    let resultSearch;
    if (!req.user) {
      resultSearch = await this.commentService.getComment(commentId);
      return res.status(200).send(resultSearch);
    }
    console.log(req.user);
    resultSearch = await this.commandBus.execute(
      new GetCommentForUserUseCaseCommand(commentId, req.user.id),
    );

    if (!resultSearch) {
      return res.sendStatus(404);
    }
    return res.status(200).send(resultSearch);
  }
  @UseGuards(BearerGuard)
  @Put('/:id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Res() res,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateCommentUseCaseCommand(
        commentId,
        createCommentDto.content,
        req.user.id,
      ),
    );
    return res.sendStatus(204);
  }
  @UseGuards(BearerGuard)
  @Delete('/:id')
  async deleteComment(@Param('id') commentId: string, @Res() res, @Req() req) {
    await this.commandBus.execute(
      new DeleteCommentUseCaseCommand(commentId, req.user.id),
    );
    return res.sendStatus(204);
  }
  @UseGuards(BearerGuard)
  //@UseGuards(AuthCommentForUserGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Param('id') commentId: string,
    @Body() updateLikeStatusCommentDto: UpdateLikeStatusDto,
    @Res() res,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusCommentUseCaseCommand(
        commentId,
        updateLikeStatusCommentDto.likeStatus,
        req.user,
      ),
    );
    return res.sendStatus(204);
  }
}
