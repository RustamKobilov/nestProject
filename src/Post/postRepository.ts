import { InjectModel } from '@nestjs/mongoose';
import { NewestLikes, Post, PostDocument } from './Post';
import { Model, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDTO, outputModel, PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { ReactionRepository } from '../Like/reactionRepository';
import { CommentDocument } from '../Comment/Comment';

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
  async getPostsForBlog(
    paginationPost: PaginationDTO,
    filter,
  ): Promise<outputModel<Post>> {
    const totalCountPost = await this.postModel.count(filter);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationPost.pageNumber,
        paginationPost.pageSize,
        totalCountPost,
      );

    const sortPost = await this.postModel
      .find(filter, {
        _id: 0,
        __v: 0,
      })
      .sort({ [paginationPost.sortBy]: paginationPost.sortDirection })
      .skip(paginationFromHelperForUsers.skipPage)
      .limit(paginationPost.pageSize)
      .lean();

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationPost.pageNumber,
      pageSize: paginationPost.pageSize,
      totalCount: totalCountPost,
      items: sortPost,
    };
  }

  async getPosts(pagination: PaginationDTO) {
    const totalCountPost = await this.postModel.count({});
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        totalCountPost,
      );

    const sortPost = await this.postModel
      .find(
        {},
        {
          _id: 0,
          __v: 0,
        },
      )
      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(paginationFromHelperForUsers.skipPage)
      .limit(pagination.pageSize)
      .lean();

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCountPost,
      items: sortPost,
    };
  }
  async getPost(postId: string): Promise<Post | false> {
    const post = await this.postModel.findOne({ id: postId });
    if (!post) {
      return false;
    }
    return post;
  }
  async updatePost(postId: string, updatePostDto: CreatePostDTO) {
    const updatePost: UpdateWriteOpResult = await this.postModel.updateOne(
      { id: postId },
      {
        title: updatePostDto.title,
        shortDescription: updatePostDto.shortDescription,
        content: updatePostDto.content,
        blogId: updatePostDto.blogId,
      },
    );
    return updatePost.matchedCount === 1;
  }
  async deletePost(postId: string) {
    return await this.postModel.deleteOne({ id: postId });
  }

  async getPostsForBlogUser(
    filter: { blogId: string },
    pagination: PaginationDTO,
    userId: string,
  ) {
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
          return post;
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
}
