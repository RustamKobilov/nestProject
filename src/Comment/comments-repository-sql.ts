import { Comment } from './Comment';
import { ReactionRepository } from '../Like/reactionRepository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentViewModel } from '../viewModelDTO';
import { mapObject } from '../mapObject';
import { PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { NotFoundException } from '@nestjs/common';

export class CommentsRepositorySql {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private reactionRepository: ReactionRepository,
  ) {}

  async createCommentForPost(newComment: Comment) {
    console.log(newComment.commentatorInfo.userId);
    const queryInsertDeviceEntity = await this.dataSource.query(
      'INSERT INTO comment_entity ("id", "postId", "content", "createdAt", "userLogin",' +
        ' "userId", "likesCount","dislikesCount", "myStatus")' +
        ' VALUES ($1,$2, $3, $4, $5, $6, $7, $8, $9)',
      [
        newComment.id,
        newComment.postId,
        newComment.content,
        newComment.createdAt,
        newComment.commentatorInfo.userLogin,
        newComment.commentatorInfo.userId,
        newComment.likesInfo.likesCount,
        newComment.likesInfo.dislikesCount,
        newComment.likesInfo.myStatus,
      ],
    );
    return;
  }

  async getComment(id: string): Promise<CommentViewModel | false> {
    const table = await this.dataSource.query(
      'SELECT "id", "postId", "content", "createdAt", "userLogin", "userId", "likesCount",' +
        ' "dislikesCount", "myStatus"' +
        ' FROM comment_entity' +
        ' WHERE comment_entity."id" = $1',
      [id],
    );
    if (table.length < 1) {
      return false;
    }
    const comments = mapObject.mapCommentFromSql(table);
    return comments[0];
  }

  async getCommentForUser(
    commentId: string,
    userId: string,
  ): Promise<CommentViewModel | false> {
    const table = await this.dataSource.query(
      'SELECT "id", "postId", "content", "createdAt", "userLogin", "userId", "likesCount",' +
        ' "dislikesCount", "myStatus"' +
        ' FROM comment_entity' +
        ' WHERE comment_entity."id" = $1',
      [commentId],
    );
    if (table.length < 1) {
      return false;
    }
    const comment = mapObject.mapCommentFromSql(table)[0];
    const zaprosForNewestLike =
      'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
      ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
      " '" +
      comment.id +
      "' " +
      ' AND reaction_entity."userId" = ' +
      " '" +
      userId +
      "' ";
    const tableNewestLike = await this.dataSource.query(zaprosForNewestLike);
    if (tableNewestLike.length < 1) {
      return comment;
    }
    comment.likesInfo.myStatus = tableNewestLike[0].status;

    return comment;
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    const update = await this.dataSource.query(
      'UPDATE comment_entity' +
        ' SET "content" = $1' +
        ' WHERE comment_entity."id" = $2',
      [content, id],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }

  async updateCountReactionComment(
    commentId: string,
    countLikes: number,
    countDislike: number,
  ): Promise<boolean> {
    console.log(countLikes);
    console.log(countDislike);
    const update = await this.dataSource.query(
      'UPDATE comment_entity' +
        ' SET "likesCount" = $1,"dislikesCount" = $2' +
        ' WHERE comment_entity."id" = $3',
      [countLikes, countDislike, commentId],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }

  async deleteComment(commentId: string) {
    const deleteComment = await this.dataSource.query(
      'DELETE FROM comment_entity' + ' WHERE comment_entity."id" = $1',
      [commentId],
    );
    console.log('delete comment');
    console.log(deleteComment[1]);
    if (deleteComment[1] > 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }

  async getCommentsForPost(
    pagination: PaginationDTO,
    filter,
  ) /*: Promise<outputModel<PostViewModel>>*/ {
    console.log('tyt');
    const filterCount =
      'SELECT COUNT (*) FROM comment_entity WHERE "postId" = ' +
      "'" +
      filter.postId +
      "'";
    const sortDirection = pagination.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountPost = await this.dataSource.query(filterCount);
    const countCommentsForPost = queryCountPost[0].count;

    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );

    const zapros =
      'SELECT "id", "postId", "content", "createdAt", "userLogin", "userId", "likesCount",' +
      ' "dislikesCount", "myStatus"' +
      ' FROM comment_entity' +
      ' WHERE comment_entity."postId" = ' +
      " '" +
      filter.postId +
      "' " +
      ' ORDER BY' +
      ' "' +
      pagination.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      pagination.pageSize +
      ' OFFSET ' +
      paginationFromHelperForComments.skipPage;

    const table = await this.dataSource.query(zapros);

    const comments = mapObject.mapCommentFromSql(table);

    return {
      pagesCount: paginationFromHelperForComments.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countCommentsForPost,
      items: comments,
    };
  }

  async getCommentsForPostUser(
    pagination: PaginationDTO,
    filter,
    userId: string,
  ) {
    const filterCount =
      'SELECT COUNT (*) FROM comment_entity WHERE "postId" = ' +
      "'" +
      filter.postId +
      "'";
    const sortDirection = pagination.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountPost = await this.dataSource.query(filterCount);
    const countCommentsForPost = queryCountPost[0].count;
    console.log('chekpoint1');
    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );

    const zapros =
      'SELECT "id", "postId", "content", "createdAt", "userLogin", "userId", "likesCount",' +
      ' "dislikesCount", "myStatus"' +
      ' FROM comment_entity' +
      ' WHERE comment_entity."postId" = ' +
      " '" +
      filter.postId +
      "' " +
      ' ORDER BY' +
      ' "' +
      pagination.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      pagination.pageSize +
      ' OFFSET ' +
      paginationFromHelperForComments.skipPage;

    const table = await this.dataSource.query(zapros);
    console.log('chekpoint2');
    const comments = mapObject.mapCommentFromSql(table);
    for (const comment of comments) {
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
      items: comments,
    };
  }
}
