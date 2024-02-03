import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './Post.Entity';
import { NewestLikes, Post } from './Post';
import { likeStatus } from '../Enum';
import { mapObject } from '../mapObject';
import { CreatePostDTO, outputModel, PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { PostViewModel } from '../viewModelDTO';
import { NotFoundException } from '@nestjs/common';
import { ReactionEntity } from '../Reaction/Reaction.Entity';
import { ReactionRepository } from '../Reaction/reactionRepository';

export class PostsRepositoryTypeORM {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepositoryTypeOrm: Repository<PostEntity>,
    @InjectRepository(ReactionEntity)
    private readonly reactionRepositoryTypeOrm: Repository<ReactionEntity>,
    private reactionRepository: ReactionRepository,
  ) {}

  async createPost(newPost: Post) {
    const qbPost = await this.postRepositoryTypeOrm.save(<PostEntity>{
      id: newPost.id,
      userId: newPost.userId,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      myStatus: newPost.extendedLikesInfo.myStatus,
      likesCount: newPost.extendedLikesInfo.likesCount,
      dislikesCount: newPost.extendedLikesInfo.dislikesCount,
      vision: true,
    });
    return;
  }
  async getPost(postId: string): Promise<Post | false> {
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const take = await qbPost
      .where('p.id = :id AND p.vision = :vision', { id: postId, vision: true })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }
    const post = mapObject.mapRawManyQBOnTableNameIsNotNull(take, [
      'p' + '_',
    ])[0];
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const limitLike = 3;
    const tableNewestLike = await qbReaction
      .where(
        'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
        {
          parentId: post.id,
          status: likeStatus.Like,
          vision: true,
        },
      )
      .orderBy('r.' + 'createdAt', 'DESC')
      .take(limitLike)
      .getRawMany();
    const newestLike = mapObject.mapRawManyQBOnTableNameIsNotNull(
      tableNewestLike,
      ['r' + '_'],
    );
    const postViewModel = mapObject.mapPostFromSql(
      post,
      mapObject.mapNewestLikesFromSql(tableNewestLike),
    );
    return postViewModel;
  }
  async getPosts(paginationPost: PaginationDTO) {
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const totalCountPost = await qbPost
      .where('p.vision = :vision', { vision: true })
      .getCount();
    console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    //console.log(paginationPost);
    const zaprosQb = await qbPost
      .where('p.vision = :vision', { vision: true })
      .orderBy('p.' + paginationPost.sortBy, sortDirection)
      .limit(paginationPost.pageSize)
      .offset(paginationFromHelperForPosts.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);
    const posts = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'p' + '_',
    ]);
    //console.log(table);
    const resultPosts: PostViewModel[] = [];
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    // console.log(await qbReaction.getRawMany());
    if (posts.length > 0) {
      for (const post of posts) {
        const limitLike = 3;
        const tableNewestLike = await qbReaction
          .where(
            'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
            {
              parentId: post.id,
              status: likeStatus.Like,
              vision: true,
            },
          )
          .orderBy('r.' + 'createdAt', sortDirection)
          .limit(limitLike)
          .getRawMany();
        const newestLike = mapObject.mapRawManyQBOnTableNameIsNotNull(
          tableNewestLike,
          ['r' + '_'],
        );

        const postViewModel = mapObject.mapPostFromSqlFromViewModel(
          post,
          mapObject.mapNewestLikesFromSql(newestLike),
        );
        resultPosts.push(postViewModel);
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
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const take = await qbPost
      .where('p.id = :id AND p.vision = :vision', { id: postId, vision: true })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }
    const post = mapObject.mapRawManyQBOnTableNameIsNotNull(take, [
      'p' + '_',
    ])[0];

    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const limitLike = 3;
    const tableNewestLike = await qbReaction
      .where(
        'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
        {
          parentId: post.id,
          status: likeStatus.Like,
          vision: true,
        },
      )
      .orderBy('r.' + 'createdAt', 'DESC')
      .limit(limitLike)
      .getRawMany();
    const newestLike = mapObject.mapRawManyQBOnTableNameIsNotNull(
      tableNewestLike,
      ['r' + '_'],
    );
    console.log(newestLike);
    const postViewModel = mapObject.mapPostFromSqlFromViewModel(
      post,
      mapObject.mapNewestLikesFromSql(newestLike),
    );

    const searchReaction =
      await this.reactionRepository.getReactionUserForParent(postId, userId);

    if (!searchReaction) {
      return postViewModel;
    }

    postViewModel.extendedLikesInfo.myStatus = searchReaction.status;

    return postViewModel;
  }
  async getPostsForUser(filter, paginationPost: PaginationDTO, userId: string) {
    console.log('filter');
    console.log(filter);
    console.log('filter.blogId');
    console.log(filter.blogId);

    const whereFilterSql =
      filter.blogId === null || filter.blogId === undefined
        ? {
            where: '',
            params: {},
          }
        : {
            where: 'p.blogId = :blogId',
            params: { blogId: `${filter.blogId}` },
          };
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const totalCountPost = await qbPost
      .where(whereFilterSql.where, whereFilterSql.params)
      .andWhere('p.vision = :vision', { vision: true })
      .getCount();
    // console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    const zaprosQb = await qbPost
      .where(whereFilterSql.where, whereFilterSql.params)
      .andWhere('p.vision = :vision', { vision: true })
      .orderBy('p.' + paginationPost.sortBy, sortDirection)
      .limit(paginationPost.pageSize)
      .offset(paginationFromHelperForPosts.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);
    const posts = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'p' + '_',
    ]);
    //console.log(table);
    const resultPosts: PostViewModel[] = [];
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    // console.log(await qbReaction.getRawMany());
    if (posts.length > 0) {
      for (const post of posts) {
        const limitLike = 3;
        const tableNewestLike = await qbReaction
          .where(
            'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
            {
              parentId: post.id,
              status: likeStatus.Like,
              vision: true,
            },
          )
          .orderBy('r.' + 'createdAt', sortDirection)
          .limit(limitLike)
          .getRawMany();
        const newestLike = mapObject.mapRawManyQBOnTableNameIsNotNull(
          tableNewestLike,
          ['r' + '_'],
        );
        const postViewModel = mapObject.mapPostFromSqlFromViewModel(
          post,
          mapObject.mapNewestLikesFromSql(newestLike),
        );
        const searchReaction =
          await this.reactionRepository.getReactionUserForParent(
            post.id,
            userId,
          );

        if (searchReaction) {
          postViewModel.extendedLikesInfo.myStatus = searchReaction.status;
        }

        resultPosts.push(postViewModel);
      }
    }

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
  ): Promise<outputModel<PostViewModel>> {
    console.log(blogId + ' blogId');
    const whereFilter = {
      where: 'p.blogId = :blogId',
      params: { blogId: `${blogId}` },
    };
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const totalCountPost = await qbPost
      .where(whereFilter.where, whereFilter.params)
      .andWhere('p.vision = :vision', { vision: true })
      .getCount();
    // console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    const zaprosQb = await qbPost
      .where(whereFilter.where, whereFilter.params)
      .andWhere('p.vision = :vision', { vision: true })
      .orderBy('p.' + paginationPost.sortBy, sortDirection)
      .limit(paginationPost.pageSize)
      .offset(paginationFromHelperForPosts.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);
    const posts = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'p' + '_',
    ]);
    //console.log(table);
    const resultPosts: PostViewModel[] = [];
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    // console.log(await qbReaction.getRawMany());
    if (posts.length > 0) {
      for (const post of posts) {
        const limitLike = 3;
        const tableNewestLike = await qbReaction
          .where(
            'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
            {
              parentId: post.id,
              status: likeStatus.Like,
              vision: true,
            },
          )
          .orderBy('r.' + 'createdAt', sortDirection)
          .limit(limitLike)
          .getRawMany();
        const newestLike = mapObject.mapRawManyQBOnTableNameIsNotNull(
          tableNewestLike,
          ['r' + '_'],
        );
        const postViewModel = mapObject.mapPostFromSqlFromViewModel(
          post,
          mapObject.mapNewestLikesFromSql(newestLike),
        );

        resultPosts.push(postViewModel);
      }
    }

    return {
      pagesCount: paginationFromHelperForPosts.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: resultPosts,
    };
  }
  async getPostsForBlogByBlogger(
    paginationPost: PaginationDTO,
    blogId: string,
    userId: string,
  ): Promise<outputModel<PostViewModel>> {
    console.log(blogId + ' blogId');
    const whereFilter = {
      where: 'p.blogId = :blogId AND p.userId = :userId',
      params: { blogId: `${blogId}`, userId: `${userId}` },
    };
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const sortDirection = paginationPost.sortDirection === 1 ? 'ASC' : 'DESC';
    const totalCountPost = await qbPost
      .where(whereFilter.where, whereFilter.params)
      .andWhere('p.vision = :vision', { vision: true })
      .getCount();
    // console.log(totalCountPost);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );
    const zaprosQb = await qbPost
      .where(whereFilter.where, whereFilter.params)
      .andWhere('p.vision = :vision', { vision: true })
      .orderBy('p.' + paginationPost.sortBy, sortDirection)
      .limit(paginationPost.pageSize)
      .offset(paginationFromHelperForPosts.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);
    const posts = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'p' + '_',
    ]);
    //console.log(table);
    const resultPosts: PostViewModel[] = [];
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    // console.log(await qbReaction.getRawMany());
    if (posts.length > 0) {
      for (const post of posts) {
        const limitLike = 3;
        const tableNewestLike = await qbReaction
          .where(
            'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
            {
              parentId: post.id,
              status: likeStatus.Like,
              vision: true,
            },
          )
          .orderBy('r.' + 'createdAt', sortDirection)
          .limit(limitLike)
          .getRawMany();
        const newestLike = mapObject.mapRawManyQBOnTableNameIsNotNull(
          tableNewestLike,
          ['r' + '_'],
        );
        const postViewModel = mapObject.mapPostFromSqlFromViewModel(
          post,
          mapObject.mapNewestLikesFromSql(newestLike),
        );

        resultPosts.push(postViewModel);
      }
    }

    return {
      pagesCount: paginationFromHelperForPosts.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: resultPosts,
    };
  }
  async updatePost(
    postId: string,
    updatePostDto: CreatePostDTO,
    blogId: string,
  ) {
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const update = await qbPost
      .update(PostEntity)
      .set({
        title: updatePostDto.title,
        shortDescription: updatePostDto.shortDescription,
        content: updatePostDto.content,
        blogId: blogId,
      })
      .where('id = :id', { id: postId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
  async updateCountReactionPost(
    postId: string,
    countLikes: number,
    countDislike: number,
    lastLikeUser: NewestLikes[],
  ): Promise<boolean> {
    console.log(countLikes);
    console.log(countDislike);
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const update = await qbPost
      .update(PostEntity)
      .set({
        likesCount: countLikes,
        dislikesCount: countDislike,
      })
      .where('id = :id', { id: postId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
  async deletePost(postId: string) {
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const deleteOperation = await qbPost
      .delete()
      .where('id = :id', { id: postId })
      .execute();
    if (deleteOperation.affected !== 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }
  async updatePostVision(userId: string, visionStatus: boolean) {
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const update = await qbPost
      .update(PostEntity)
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
  async updatePostVisionForBlog(blogId: string, visionStatus: boolean) {
    const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
    const update = await qbPost
      .update(PostEntity)
      .set({
        vision: visionStatus,
      })
      .where('blogId = :blogId', { blogId: blogId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
}
