import { PostRepository } from './postRepository';
import { CreatePostDTO, PaginationDTO } from '../DTO';
import { BlogRepository } from '../Blog/blogRepository';
import { Post } from './Post';
import { randomUUID } from 'crypto';
import { likeStatus } from '../Enum';
import { mapObject } from '../mapObject';
import { PostViewModel } from '../viewModelDTO';
import { Injectable } from '@nestjs/common';
import { helper } from '../helper';
@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}

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
    const pagination = helper.getPostPaginationValues(postPagination);
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
