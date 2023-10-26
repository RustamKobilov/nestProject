import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from './Post';
import { mapObject } from '../mapObject';
import { ReactionRepository } from '../Like/reactionRepository';

@Injectable()
export class PostRepositorySql {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private reactionRepository: ReactionRepository,
  ) {}
  async createPost(newPost: Post) {
    const queryInsertPostEntity = await this.dataSource.query(
      'INSERT INTO post_entity ("id","title", "shortDescription", "content", "blogId", "blogName", "createdAt", "myStatus", "likesCount", "dislikesCount")' +
        ' VALUES ($1,$2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        newPost.id,
        newPost.title,
        newPost.shortDescription,
        newPost.content,
        newPost.blogId,
        newPost.blogName,
        newPost.createdAt,
        newPost.extendedLikesInfo.myStatus,
        newPost.extendedLikesInfo.likesCount,
        newPost.extendedLikesInfo.dislikesCount,
      ],
    );
    return;
  }
  async getPost(postId: string): Promise<Post | false> {
    // const table = await this.dataSource.query(
    //   'SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "likesCount", "dislikesCount", "myStatus"' +
    //     ' FROM post_entity WHERE "id" = $1',
    //   [postId],
    // );
    // if (table.length < 1) {
    //   return false;
    // }
    // const tableNewestLike = await this.dataSource.query(
    //   'SELECT "idSql", "parentId", "userId", "userLogin", "status", "createdAt"' +
    //     ' FROM reaction_entity WHERE "parentId" = $1' +
    //     ' ORDER BY "createdAt" DESC LIMIT 3 OFFSET 0',
    //   [postId],
    // );
    console.log('tyt');
    const table = await this.dataSource.query(
      'SELECT "id", "title", "shortDescription", content, "blogId", "blogName",' +
        ' post_entity."createdAt", "likesCount", "dislikesCount", "myStatus","userId", "userLogin", ' +
        ' status,reaction_entity."createdAt" AS "createdAt_Reaction"' +
        ' FROM post_entity' +
        ' join reaction_entity' +
        ' on post_entity."id" = reaction_entity."parentId" AND post_entity."id" = $1',
      [postId],
    );
    console.log(table);
    //throw new NotFoundException(
    //'getPost not found for comment /commentService',
    //);
    const post = mapObject.mapPostFromSql(
      table[0],
      mapObject.mapNewestLikesFromSql(table),
    );
    return post;
  }
  // async getPostsForBlog(
  //   paginationPost: PaginationDTO,
  //   blogId: string,
  // ): Promise<outputModel<Post>> {
  //   console.log(blogId);
  //   const filterCount =
  //     'SELECT COUNT (*) FROM post_entity WHERE "blogId" = ' +
  //     "'" +
  //     blogId +
  //     "'";
  //   console.log(filterCount);
  //   const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
  //   const queryCountPost = await this.dataSource.query(filterCount);
  //   console.log('filterCount');
  //   console.log(filterCount);
  //   const totalCountPost = queryCountPost[0].count;
  //   console.log(totalCountPost);
  //   const paginationFromHelperForUsers =
  //     helper.getPaginationFunctionSkipSortTotal(
  //       paginationPost.pageNumber,
  //       paginationPost.pageSize,
  //       totalCountPost,
  //     );
  //   console.log(paginationPost);
  //   const whereFilter = ' WHERE "blogId" = ' + "'" + blogId + "'";
  //   const zapros =
  //     'SELECT  "id", "title", "shortDescription", content, "blogId", "blogName", "createdAt"' +
  //     ' FROM post_entity' +
  //     whereFilter +
  //     ' ORDER BY' +
  //     ' "' +
  //     paginationPost.sortBy +
  //     '" ' +
  //     sortDirection +
  //     ' LIMIT ' +
  //     paginationPost.pageSize +
  //     ' OFFSET ' +
  //     paginationFromHelperForUsers.skipPage;
  //   console.log(zapros);
  //   const table = await this.dataSource.query(zapros);
  //   console.log(table);
  //
  //   // const resulPostsAddLikes = await Promise.all(
  //   //   table.map(async (post: Post) => {
  //   //     const postUpgrade = await mapObject.mapPost(post);
  //   //     const searchReaction =
  //   //       await this.reactionRepository.getReactionUserForParent(
  //   //         postUpgrade.id,
  //   //         userId,
  //   //       );
  //   //     if (!searchReaction) {
  //   //       return postUpgrade;
  //   //     }
  //   //     postUpgrade.extendedLikesInfo.myStatus = searchReaction.status;
  //
  //       // postUpgrade.extendedLikesInfo.newestLikes.sort((x, y) =>
  //       //   y.addedAt.localeCompare(x.addedAt),
  //       // );
  //
  //       return postUpgrade;
  //     }),
  //   );
  //
  //   return {
  //     pagesCount: paginationFromHelperForUsers.totalCount,
  //     page: paginationPost.pageNumber,
  //     pageSize: paginationPost.pageSize,
  //     totalCount: totalCountPost,
  //     items: resulPostsSortDate,
  //   };
  //}
}
