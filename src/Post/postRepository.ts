import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './Post';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDTO, outputModel, PaginationDTO } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { ReactionRepository } from '../Like/reactionRepository';

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
  async getPost(postId: string): Promise<Post> {
    const post = await this.postModel.findOne({ id: postId });
    if (!post) {
      throw new NotFoundException('If specified blog is not exists');
    }
    return post;
  }
  async updatePost(postId: string, updatePostDto: CreatePostDTO) {
    await this.getPost(postId);
    const updatePost = await this.postModel.updateOne(
      { id: postId },
      {
        title: updatePostDto.title,
        shortDescription: updatePostDto.shortDescription,
        content: updatePostDto.content,
        blogId: updatePostDto.blogId,
      },
    );
    return;
  }
  async deletePost(postId: string) {
    await this.postModel.deleteOne({ id: postId });
    return;
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
    // find(filter, { _id: 0, __v: 0 })
    //   .sort({ [pagination.sortBy]: pagination.sortDirection })
    //   .skip(paginationFromHelperForPosts.skipPage)
    //   .limit(pagination.pageSize)
    //   .lean();

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
}
