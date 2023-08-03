import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CommentService } from '../../Comment/commentService';

export class AuthCommentForUserGuard implements CanActivate {
  constructor(private commentService: CommentService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // we use a hardcoded string to validate the user for sake of simplicity
    const comment = await this.commentService.getComment(request.params.id);
    //req.user paste bearerGuard
    if (comment.commentatorInfo.userId !== request.user?.id) {
      throw new ForbiddenException('ne svoi comment CommentForUserGuard');
    }
    return true;
  }
}
