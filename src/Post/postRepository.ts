import { InjectModel } from '@nestjs/mongoose';
import { NewestLikes, Post, PostDocument } from './Post';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreatePostDTO, outputModel, PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { ReactionRepository } from '../Reaction/reactionRepository';
import { PostViewModel } from '../viewModelDTO';
import { PostEntity } from './Post.Entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private reactionRepository: ReactionRepository,
  ) {}
  async createPost(newPost: Post) {
    console.log(newPost);
    const createPost = new this.postModel(newPost);
    await createPost.save();
    return;
  }
  async getPost(postId: string): Promise<Post | false> {
    const post = await this.postModel.findOne({ id: postId }).exec();
    if (!post) {
      return false;
    }
    return post;
  }
  async getPosts(pagination: PaginationDTO) {
    const totalCountPost = await this.postModel.count({});
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        totalCountPost,
      );

    const posts = await this.postModel
      .aggregate([
        { $match: {} },
        { $sort: { [pagination.sortBy]: pagination.sortDirection } },
        { $skip: paginationFromHelperForUsers.skipPage },
        { $limit: pagination.pageSize },
      ])
      .exec()
      .catch((err) => {
        return err;
      });

    const resulPostsSortDate = await Promise.all(
      posts.map(async (post: Post) => {
        const postUpgrade = await mapObject.mapPost(post);

        return postUpgrade;
      }),
    );

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCountPost,
      items: resulPostsSortDate,
    };
  }
  async getPostForUser(
    postId: string,
    userId: string,
  ): Promise<PostViewModel | false> {
    const postForUser = await this.postModel.findOne(
      { id: postId },
      { _id: false },
    );

    if (!postForUser) {
      return false;
    }
    const postUpgrade = await mapObject.mapPost(postForUser);

    const searchReaction =
      await this.reactionRepository.getReactionUserForParent(postId, userId);

    if (!searchReaction) {
      return postUpgrade;
    }

    postUpgrade.extendedLikesInfo.myStatus = searchReaction.status;

    return postUpgrade;
  }
  async getPostsForUser(filter, pagination: PaginationDTO, userId: string) {
    const countPostsForBlog = await this.postModel.countDocuments(filter);
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countPostsForBlog,
      );

    const postsForBlogs = await this.postModel
      .aggregate([
        { $match: filter },
        { $sort: { [pagination.sortBy]: pagination.sortDirection } },
        { $skip: paginationFromHelperForPosts.skipPage },
        { $limit: pagination.pageSize },
      ])
      .exec()
      .catch((err) => {
        return err;
      });

    const resulPostsAddLikes = await Promise.all(
      postsForBlogs.map(async (post: Post) => {
        const postUpgrade = await mapObject.mapPost(post);
        const searchReaction =
          await this.reactionRepository.getReactionUserForParent(
            postUpgrade.id,
            userId,
          );
        if (!searchReaction) {
          return postUpgrade;
        }
        postUpgrade.extendedLikesInfo.myStatus = searchReaction.status;

        return postUpgrade;
      }),
    );

    return {
      pagesCount: paginationFromHelperForPosts.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countPostsForBlog,
      items: resulPostsAddLikes,
    };
  }
  async getPostsByBlog(
    paginationPost: PaginationDTO,
    blogId: string,
  ): Promise<outputModel<Post>> {
    const filter = { blogId: blogId };
    const totalCountPost = await this.postModel.count(filter);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );

    const postsForBlogs = await this.postModel
      .aggregate([
        { $match: filter },
        { $sort: { [paginationPost.sortBy]: paginationPost.sortDirection } },
        { $skip: paginationFromHelperForUsers.skipPage },
        { $limit: paginationPost.pageSize },
      ])
      .exec()
      .catch((err) => {
        return err;
      });

    const resulPostsSortDate = await Promise.all(
      postsForBlogs.map(async (post: Post) => {
        const postUpgrade = await mapObject.mapPost(post);

        return postUpgrade;
      }),
    );

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: resulPostsSortDate,
    };
  }
  async updatePost(
    postId: string,
    updatePostDto: CreatePostDTO,
    blogId: string,
  ) {
    const updatePost: UpdateWriteOpResult = await this.postModel.updateOne(
      { id: postId },
      {
        title: updatePostDto.title,
        shortDescription: updatePostDto.shortDescription,
        content: updatePostDto.content,
        blogId: blogId,
      },
    );
    return updatePost.matchedCount === 1;
  }
  async updateCountReactionPost(
    postId: string,
    countLikes: number,
    countDislike: number,
    lastLikeUser: NewestLikes[],
  ): Promise<boolean> {
    console.log(countLikes);
    console.log(countDislike);
    const updateExtendedLikes: UpdateWriteOpResult =
      await this.postModel.updateOne(
        { id: postId },
        {
          $set: {
            'extendedLikesInfo.likesCount': countLikes,
            'extendedLikesInfo.dislikesCount': countDislike,
            'extendedLikesInfo.newestLikes': lastLikeUser,
          },
        },
      );

    return updateExtendedLikes.matchedCount === 1;
  }
  async deletePost(postId: string) {
    return await this.postModel.deleteOne({ id: postId });
  }
  async updatePostVision(userId: string, visionStatus: boolean) {
    return true;
  }
  //   const qbPost = await this.postRepositoryTypeOrm.createQueryBuilder('p');
  //   const update = await qbPost
  //     .update(PostEntity)
  //     .set({
  //       vision: visionStatus,
  //     })
  //     .where('userId = :userId', { userId: userId })
  //     .execute();
  //
  //   if (!update.affected) {
  //     return false;
  //   }
  //   return true;
  // }
}
