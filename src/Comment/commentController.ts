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
import { CreateCommentDto, UpdateLikeStatusCommentDto } from '../DTO';
import { AuthCommentForUserGuard } from '../auth/Guard/authCommentForUserGuard';
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(IdenteficationUserGuard)
  @Get('/:id')
  async getComment(@Param('id') commentId: string, @Res() res, @Req() req) {
    let resultSearch;
    if (!req.user) {
      resultSearch = await this.commentService.getComment(commentId);
      return res.status(200).send(resultSearch);
    }
    console.log(req.user);
    resultSearch = await this.commentService.getCommentOnIdForUser(
      commentId,
      req.user,
    );

    if (!resultSearch) {
      return res.sendStatus(404);
    }
    return res.status(200).send(resultSearch);
  }
  @UseGuards(BearerGuard)
  @UseGuards(AuthCommentForUserGuard)
  @Put('/:id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Res() res,
    @Req() req,
  ) {
    await this.commentService.updateCommentOnId(
      commentId,
      createCommentDto.content,
    );
    return res.sendStatus(204);
  }
  @UseGuards(BearerGuard)
  @UseGuards(AuthCommentForUserGuard)
  @Delete('/:id')
  async deleteComment(@Param('id') commentId: string, @Res() res, @Req() req) {
    await this.commentService.deleteComment(commentId);
    return res.sendStatus(204);
  }
  @UseGuards(BearerGuard)
  @UseGuards(AuthCommentForUserGuard)
  @Put('/:id')
  async updateLikeStatus(
    @Param('id') commentId: string,
    @Body() updateLikeStatusCommentDto: UpdateLikeStatusCommentDto,
    @Res() res,
    @Req() req,
  ) {
    await this.commentService.updateLikeStatusComment(
      commentId,
      updateLikeStatusCommentDto.likeStatus,
      req.user,
    );
    return res.sendStatus(204);
  }
}
//TODO сделать логику не автор.пользователя и авториз.комменты