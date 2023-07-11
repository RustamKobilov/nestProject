import { PostRepository } from './postRepository';
import { CreateCommentByPostDTO, CreatePostDTO, PaginationDTO } from '../DTO';
import { BlogRepository } from '../Blog/blogRepository';
import { Post } from './Post';
import { randomUUID } from 'crypto';
import { likeStatus } from '../Enum';
import { mapObject } from '../mapObject';
import { LikeStatus, PostViewModel } from '../viewModelDTO';
import { Injectable } from '@nestjs/common';
import { helper } from '../helper';
import { Comment, CommentatorInfo } from './Comment';
import { Prop } from '@nestjs/mongoose';
import { LikesInfo } from './LikesInfo/LikesInfo';
@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}
  async createNewComment(
    createCommentDto: CreateCommentByPostDTO,
    postId: string,
  ) {
    const post = await this.postRepository.getPost(postId);
    const commentatorInfo: CommentatorInfo = {
      userId: 'ssr',
      userLogin: 'stree',
    };
    const likesInfo: LikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };
    const comment: Comment = {
      postId: postId,
      id: randomUUID(),
      content: createCommentDto.content,
      commentatorInfo: commentatorInfo,
      createdAt: new Date().toISOString(),
      likesInfo: likesInfo,
    };
  }
  async createNewPost(createPostDto: CreatePostDTO): Promise<PostViewModel> {
    const blog = await this.blogRepository.getBlog(createPostDto.blogId);
    const post: Post = {
      id: randomUUID(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
    };
    await this.postRepository.createPost(post);
    const outputPostModel = mapObject.mapPost(post);
    return outputPostModel;
  }
  async getPosts(postPagination: PaginationDTO) {
    console.log(postPagination);
    const pagination = helper.getPostPaginationValues(postPagination);
    console.log(pagination);
    return this.postRepository.getPosts(pagination, {});
  }
  async getPost(postId: string): Promise<Post> {
    return this.postRepository.getPost(postId);
  }

  async updatePost(postId: string, updatePostDto: CreatePostDTO) {
    return this.postRepository.updatePost(postId, updatePostDto);
  }

  async deletePost(postId: string) {
    await this.postRepository.getPost(postId);
    return this.postRepository.deletePost(postId);
  }
}
