import { PostRepository } from './postRepository';
import { CreatePostDTO, PaginationDTO } from '../DTO';
import { BlogRepository } from '../Blog/blogRepository';
import { Post } from './Post';
import { randomUUID } from 'crypto';
import { likeStatus } from '../Enum';
import { mapObject } from '../mapObject';
import { PostViewModel } from '../viewModelDTO';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { helper } from '../helper';
import { User } from '../User/User';
import { ReactionRepository } from '../Like/reactionRepository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
    private readonly reactionRepository: ReactionRepository,
  ) {}

  async createNewPost(createPostDto: CreatePostDTO): Promise<PostViewModel> {
    const blog = await this.blogRepository.getBlog(createPostDto.blogId);
    if (!blog) {
      throw new BadRequestException('blogId not found for blog /postService');
    }
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
    const pagination = helper.getPostPaginationValues(postPagination);
    return this.postRepository.getPosts(pagination);
  }
  async getPostsForUser(getPagination: PaginationDTO, userId: string) {
    const filter = {};
    const pagination = helper.getCommentPaginationValues(getPagination);
    return await this.postRepository.getPostsForUser(
      filter,
      pagination,
      userId,
    );
  }
  async getPostsByBlog(postPagination: PaginationDTO, filter) {
    const pagination = helper.getPostPaginationValues(postPagination);
    return await this.postRepository.getPostsForBlog(pagination, filter);
  }
  async getPost(postId: string): Promise<PostViewModel | false> {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const outputPost = mapObject.mapPost(post);
    return outputPost;
  }
  async updatePost(postId: string, updatePostDto: CreatePostDTO) {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const blog = await this.blogRepository.getBlog(updatePostDto.blogId);
    if (!blog) {
      throw new BadRequestException('blogId not found blogs /postService');
    }
    const updatePost = await this.postRepository.updatePost(
      postId,
      updatePostDto,
    );
    if (!updatePost) {
      throw new NotFoundException('postId not update post /postService');
    }
    return;
  }

  async deletePost(postId: string) {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    return this.postRepository.deletePost(postId);
  }
  async getPostForBlogUser(
    blogId: string,
    getPagination: PaginationDTO,
    userId: string,
  ) {
    const filter = { blogId: blogId };
    const pagination = helper.getCommentPaginationValues(getPagination);
    return await this.postRepository.getPostsForUser(
      filter,
      pagination,
      userId,
    );
  }
  async updateLikeStatusPost(
    postId: string,
    likeStatus: likeStatus,
    user: User,
  ) {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const updateReaction = await this.reactionRepository.getCountLikeStatusUser(
      post.id,
      user,
      likeStatus,
    );

    if (!updateReaction) {
      throw new NotFoundException(
        'comment ne obnovilsya, CommentService ,update',
      );
    }
    const updateCountLike = await this.postRepository.updateCountReactionPost(
      post.id,
      updateReaction.likesCount,
      updateReaction.dislikesCount,
      updateReaction.lastLikeUser,
    );
    if (!updateCountLike) {
      throw new NotFoundException('no update reaction /postService');
    }
    return;
  }

  async getPostForUser(postId: string, userId: string) {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    return this.postRepository.getPostForUser(postId, userId);
  }
}
