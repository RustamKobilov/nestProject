import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CommentService } from '../../Comment/commentService';
@Injectable()
export class AuthCommentForUserGuard implements CanActivate {
  constructor(private commentService: CommentService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // we use a hardcoded string to validate the user for sake of simplicity
    const comment = await this.commentService.getComment(request.params.id);
    //req.user paste bearerGuard
    console.log(comment.commentatorInfo.userId + ' userId in comment');
    console.log(request.user?.id + ' userId in bearer token');
    if (comment.commentatorInfo.userId !== request.user?.id) {
      throw new ForbiddenException('ne svoi comment CommentForUserGuard');
    }
    return true;
  }
}
