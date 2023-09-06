import { PostRepository } from './postRepository';
import { CreatePostDTO } from '../DTO';
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

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
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
  async getPost(postId: string): Promise<PostViewModel | false> {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const outputPost = mapObject.mapPost(post);
    return outputPost;
  }
}
