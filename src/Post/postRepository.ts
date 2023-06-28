import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './Post';
import { FilterQuery, Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDTO, outputModel, PaginationDTO } from '../DTO';
import { helper } from '../helper';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  async createPost(newPost: Post) {
    console.log(newPost);
    const createPost = new this.postModel(newPost);
    await createPost.save();
    return;
  }
  async getPosts(
    paginationPost: PaginationDTO,
    filter: FilterQuery<PostDocument>,
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
        hash: 0,
        salt: 0,
        password: 0,
        userConfirmationInfo: 0,
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

  async getPost(postId: string): Promise<Post> {
    console.log(postId);
    const post = await this.postModel.findOne({ id: postId });
    console.log(post);
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
}
