import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionEntity } from '../Reaction/Reaction.Entity';
import { CommentEntity } from './Comment.Entity';
import { Comment } from './Comment';
import { CommentViewModel } from '../viewModelDTO';
import { mapObject } from '../mapObject';
import { NotFoundException } from '@nestjs/common';
import { PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { ReactionRepository } from '../Reaction/reactionRepository';
import { PostEntity } from '../Post/Post.Entity';

export class CommentRepositoryTypeORM {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepositoryTypeOrm: Repository<CommentEntity>,
    @InjectRepository(ReactionEntity)
    private readonly reactionRepositoryTypeOrm: Repository<ReactionEntity>,
    private reactionRepository: ReactionRepository,
  ) {}
  async createCommentForPost(newComment: Comment) {
    console.log(newComment.commentatorInfo.userId);
    const qbComment = await this.commentRepositoryTypeOrm.save(<CommentEntity>{
      id: newComment.id,
      postId: newComment.postId,
      content: newComment.content,
      createdAt: newComment.createdAt,
      userLogin: newComment.commentatorInfo.userLogin,
      userId: newComment.commentatorInfo.userId,
      likesCount: newComment.likesInfo.likesCount,
      dislikesCount: newComment.likesInfo.dislikesCount,
      myStatus: newComment.likesInfo.myStatus,
      vision: true,
    });
    return;
  }
  async getComment(id: string): Promise<CommentViewModel | false> {
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const take = await qbComment.where('id = :id', { id: id }).getRawMany();

    if (take.length < 1) {
      return false;
    }
    const comments = mapObject.mapRawManyQBOnTableName(take, ['c' + '_']);
    const commentViewModels = mapObject.mapCommentFromSql(comments);
    return commentViewModels[0];
  }
  async getCommentForUser(
    commentId: string,
    userId: string,
  ): Promise<CommentViewModel | false> {
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const take = await qbComment
      .where('id = :id', { id: commentId })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }
    const comments = mapObject.mapRawManyQBOnTableName(take, ['c' + '_']);
    const commentViewModels = mapObject.mapCommentFromSql(comments)[0];

    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const limitLike = 3;
    const tableNewestLike = await qbReaction
      .where(
        'r.parentId = :parentId AND r.userId = :userId AND r.vision = :vision',
        {
          parentId: commentViewModels.id,
          userId: userId,
          vision: true,
        },
      )
      .orderBy('r.' + 'createdAt', 'DESC')
      .limit(limitLike)
      .getRawMany();
    if (tableNewestLike.length < 1) {
      return commentViewModels;
    }
    const newestLike = mapObject.mapRawManyQBOnTableName(tableNewestLike, [
      'r' + '_',
    ]);
    commentViewModels.likesInfo.myStatus = newestLike[0].status;

    return commentViewModels;
  }
  async updateComment(id: string, content: string): Promise<boolean> {
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const update = await qbComment
      .update(CommentEntity)
      .set({
        content: content,
      })
      .where('id = :id', { id: id })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
  async updateCountReactionComment(
    commentId: string,
    countLikes: number,
    countDislike: number,
  ): Promise<boolean> {
    console.log(countLikes);
    console.log(countDislike);
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const update = await qbComment
      .update(CommentEntity)
      .set({
        likesCount: countLikes,
        dislikesCount: countDislike,
      })
      .where('id = :id', { id: commentId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
  async deleteComment(commentId: string) {
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const deleteOperation = await qbComment
      .delete()
      .where('id = :id', { id: commentId })
      .execute();
    if (deleteOperation.affected !== 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }
  async getCommentsForPost(
    pagination: PaginationDTO,
    filter,
  ) /*: Promise<outputModel<PostViewModel>>*/ {
    const whereFilter =
      filter.postId === null || filter.postId === undefined
        ? {
            where: '',
            params: {},
          }
        : {
            where: 'c.postId = :postId',
            params: { postId: `${filter.postId}` },
          };
    const sortDirection = pagination.sortDirection === 1 ? 'ASC' : 'DESC';
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const countCommentsForPost = await qbComment
      .where(whereFilter.where, whereFilter.params)
      .getCount();
    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );
    const zaprosQb = await qbComment
      .where(whereFilter.where, whereFilter.params)
      .andWhere('c.vision = :vision', { vision: true })
      .orderBy('c.' + pagination.sortBy, sortDirection)
      .limit(pagination.pageSize)
      .offset(paginationFromHelperForComments.skipPage)
      .getRawMany();
    console.log('after');

    const comments = mapObject.mapRawManyQBOnTableName(zaprosQb, ['c' + '_']);
    const commentsViewModel = mapObject.mapCommentFromSql(comments);

    return {
      pagesCount: paginationFromHelperForComments.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countCommentsForPost,
      items: commentsViewModel,
    };
  }
  async getCommentsForPostUser(
    pagination: PaginationDTO,
    filter,
    userId: string,
  ) {
    const whereFilter =
      filter.postId === null || filter.postId === undefined
        ? {
            where: '',
            params: {},
          }
        : {
            where: 'c.postId = :postId',
            params: { postId: `${filter.postId}` },
          };
    const sortDirection = pagination.sortDirection === 1 ? 'ASC' : 'DESC';
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const countCommentsForPost = await qbComment
      .where(whereFilter.where, whereFilter.params)
      .andWhere('c.vision = :vision', { vision: true })
      .getCount();
    console.log('count comment' + countCommentsForPost);
    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );

    const zaprosQb = await qbComment
      .where(whereFilter.where, whereFilter.params)
      .andWhere('c.vision = :vision', { vision: true })
      .orderBy('c.' + pagination.sortBy, sortDirection)
      .limit(pagination.pageSize)
      .offset(paginationFromHelperForComments.skipPage)
      .getRawMany();
    console.log('after');

    const comments = mapObject.mapRawManyQBOnTableName(zaprosQb, ['c' + '_']);

    const commentsViewModel = mapObject.mapCommentFromSql(comments);
    for (const comment of commentsViewModel) {
      const searchReaction =
        await this.reactionRepository.getReactionUserForParent(
          comment.id,
          userId,
        );
      if (searchReaction) {
        comment.likesInfo.myStatus = searchReaction.status;
      }
    }

    return {
      pagesCount: paginationFromHelperForComments.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countCommentsForPost,
      items: commentsViewModel,
    };
  }
  async updateCommentVision(userId: string, visionStatus: boolean) {
    const qbComment = await this.commentRepositoryTypeOrm.createQueryBuilder(
      'c',
    );
    const update = await qbComment
      .update(CommentEntity)
      .set({
        vision: visionStatus,
      })
      .where('userId = :userId', { userId: userId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
}
