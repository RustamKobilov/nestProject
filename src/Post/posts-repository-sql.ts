import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NewestLikes, Post } from './Post';
import { mapObject } from '../mapObject';
import { ReactionRepository } from '../Like/reactionRepository';
import { CreatePostDTO, outputModel, PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { PostViewModel } from '../viewModelDTO';

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
    const table = await this.dataSource.query(
      'SELECT "id", "title", "shortDescription", content, "blogId", "blogName",' +
        ' post_entity."createdAt", "likesCount", "dislikesCount", "myStatus"' +
        ' FROM post_entity' +
        ' WHERE post_entity."id" = $1',
      [postId],
    );
    if (table.length < 1) {
      return false;
    }
    const zaprosForNewestLike =
      'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
      ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
      " '" +
      postId +
      "' " +
      ' ORDER BY reaction_entity."createdAt" DESC LIMIT 3';
    const tableNewestLike = await this.dataSource.query(zaprosForNewestLike);
    const post = mapObject.mapPostFromSql(
      table[0],
      mapObject.mapNewestLikesFromSql(tableNewestLike),
    );
    return post;
  }
  async getPosts(paginationPost: PaginationDTO) {
    const filterCount = 'SELECT COUNT (*) FROM post_entity';
    //console.log(filterCount);
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountPost = await this.dataSource.query(filterCount);
    //console.log('filterCount');
    //console.log(filterCount);
    const totalCountPost = queryCountPost[0].count;
    // console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    //console.log(paginationPost);
    const zapros =
      'SELECT "id", "title", "shortDescription", content, "blogId", "blogName",' +
      ' post_entity."createdAt", "likesCount", "dislikesCount", "myStatus"' +
      ' FROM post_entity' +
      ' ORDER BY' +
      ' "' +
      paginationPost.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      paginationPost.pageSize +
      ' OFFSET ' +
      paginationFromHelperForPosts.skipPage;
    console.log(zapros);
    const table = await this.dataSource.query(zapros);
    //console.log(table);
    const resultPosts: Post[] = [];
    if (table.length > 0) {
      for (const postSql of table) {
        const limitLike = 3;
        const zaprosForNewestLike =
          'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
          ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
          " '" +
          postSql.id +
          "' " +
          ' ORDER BY reaction_entity."createdAt" DESC LIMIT 3';
        const tableNewestLike = await this.dataSource.query(
          zaprosForNewestLike,
        );
        const post = mapObject.mapPostFromSql(
          postSql,
          mapObject.mapNewestLikesFromSql(tableNewestLike),
        );
        resultPosts.push(post);
        //console.log(postSql);
      }
    }
    //console.log('finish');
    //console.log(resultPosts);

    return {
      pagesCount: paginationFromHelperForPosts.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: resultPosts,
    };
  }
  async getPostForUser(
    postId: string,
    userId: string,
  ): Promise<PostViewModel | false> {
    const table = await this.dataSource.query(
      'SELECT "id", "title", "shortDescription", content, "blogId", "blogName",' +
        ' post_entity."createdAt", "likesCount", "dislikesCount", "myStatus"' +
        ' FROM post_entity' +
        ' WHERE post_entity."id" = $1',
      [postId],
    );
    if (table.length < 1) {
      return false;
    }
    const postUpgrade = mapObject.mapPostFromSql(table[0]);

    const searchReaction =
      await this.reactionRepository.getReactionUserForParent(postId, userId);

    if (!searchReaction) {
      return postUpgrade;
    }

    postUpgrade.extendedLikesInfo.myStatus = searchReaction.status;

    return postUpgrade;
  }
  async getPostsForUser(filter, paginationPost: PaginationDTO, userId: string) {
    const filterCount =
      'SELECT COUNT (*) FROM post_entity WHERE "blogId" = ' +
      "'" +
      filter.blogId +
      "'";
    //console.log(filterCount);
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountPost = await this.dataSource.query(filterCount);
    //console.log('filterCount');
    //console.log(filterCount);
    const totalCountPost = queryCountPost[0].count;
    // console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    //console.log(paginationPost);
    const whereFilter = ' WHERE "blogId" = ' + "'" + filter.blogId + "'";
    const zapros =
      'SELECT "id", "title", "shortDescription", content, "blogId", "blogName",' +
      ' post_entity."createdAt", "likesCount", "dislikesCount", "myStatus"' +
      ' FROM post_entity' +
      ' WHERE post_entity."blogId" = ' +
      " '" +
      filter.blogId +
      "' " +
      ' ORDER BY' +
      ' "' +
      paginationPost.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      paginationPost.pageSize +
      ' OFFSET ' +
      paginationFromHelperForPosts.skipPage;
    console.log(zapros);
    const table = await this.dataSource.query(zapros);
    //console.log(table);
    const resultPosts: Post[] = [];
    if (table.length > 0) {
      for (const postSql of table) {
        const limitLike = 3;
        const zaprosForNewestLike =
          'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
          ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
          " '" +
          postSql.id +
          "' " +
          ' ORDER BY reaction_entity."createdAt" DESC LIMIT 3';
        const tableNewestLike = await this.dataSource.query(
          zaprosForNewestLike,
        );
        const post = mapObject.mapPostFromSql(
          postSql,
          mapObject.mapNewestLikesFromSql(tableNewestLike),
        );
        const searchReaction =
          await this.reactionRepository.getReactionUserForParent(
            postSql.id,
            userId,
          );

        if (searchReaction) {
          post.extendedLikesInfo.myStatus = searchReaction.status;
        }

        resultPosts.push(post);
        //console.log(postSql);
      }
    }
    //console.log('finish');
    //console.log(resultPosts);

    return {
      pagesCount: paginationFromHelperForPosts.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: resultPosts,
    };
  }
  async getPostsForBlog(
    paginationPost: PaginationDTO,
    blogId: string,
  ): Promise<outputModel<Post>> {
    console.log(blogId);
    const filterCount =
      'SELECT COUNT (*) FROM post_entity WHERE "blogId" = ' +
      "'" +
      blogId +
      "'";
    //console.log(filterCount);
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountPost = await this.dataSource.query(filterCount);
    //console.log('filterCount');
    //console.log(filterCount);
    const totalCountPost = queryCountPost[0].count;
    // console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    //console.log(paginationPost);
    const whereFilter = ' WHERE "blogId" = ' + "'" + blogId + "'";
    const zapros =
      'SELECT "id", "title", "shortDescription", content, "blogId", "blogName",' +
      ' post_entity."createdAt", "likesCount", "dislikesCount", "myStatus"' +
      ' FROM post_entity' +
      ' WHERE post_entity."blogId" = ' +
      " '" +
      blogId +
      "' " +
      ' ORDER BY' +
      ' "' +
      paginationPost.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      paginationPost.pageSize +
      ' OFFSET ' +
      paginationFromHelperForPosts.skipPage;
    console.log(zapros);
    const table = await this.dataSource.query(zapros);
    //console.log(table);
    const resultPosts: Post[] = [];
    if (table.length > 0) {
      for (const postSql of table) {
        const limitLike = 3;
        const zaprosForNewestLike =
          'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
          ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
          " '" +
          postSql.id +
          "' " +
          ' ORDER BY reaction_entity."createdAt" DESC LIMIT 3';
        const tableNewestLike = await this.dataSource.query(
          zaprosForNewestLike,
        );
        const post = mapObject.mapPostFromSql(
          postSql,
          mapObject.mapNewestLikesFromSql(tableNewestLike),
        );
        resultPosts.push(post);
        //console.log(postSql);
      }
    }
    //console.log('finish');
    //console.log(resultPosts);

    return {
      pagesCount: paginationFromHelperForPosts.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: resultPosts,
    };
  }
  async updatePost(postId: string, updatePostDto: CreatePostDTO) {
    const update = await this.dataSource.query(
      'UPDATE post_entity ' +
        ' SET "title" = $1,"shortDescription" = $2,' +
        '"content" = $3,"blogId" = $4' +
        ' WHERE "id" = $5',
      [
        updatePostDto.title,
        updatePostDto.shortDescription,
        updatePostDto.content,
        updatePostDto.blogId,
        postId,
      ],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async updateCountReactionPost(
    postId: string,
    countLikes: number,
    countDislike: number,
    lastLikeUser: NewestLikes[],
  ): Promise<boolean> {
    console.log(countLikes);
    console.log(countDislike);
    const update = await this.dataSource.query(
      'UPDATE post_entity ' +
        ' SET "likesCount" = $1,"dislikesCount" = $2' +
        ' WHERE "id" = $3',
      [countLikes, countDislike, postId],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async deletePost(postId: string) {
    const deleteUser = await this.dataSource.query(
      'DELETE FROM post_entity' + ' WHERE "id" = $1',
      [postId],
    );
    console.log(deleteUser[1]);
    if (deleteUser[1] != 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return;
  }
}
