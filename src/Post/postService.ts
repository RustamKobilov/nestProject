import { PostRepository } from './postRepository';
import { CreatePostDTO } from '../DTO';
import { BlogRepository } from '../Blog/blogRepository';
import { Post } from './Post';
import { randomUUID } from 'crypto';
import { ImagePurpose, likeStatus } from '../Enum';
import { mapObject } from '../mapObject';
import { PostViewModel } from '../viewModelDTO';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostEntity } from './Post.Entity';
import { ImagesRepository } from '../Images/imageRepository';
import { countMainImageForPost } from '../constant';
import { ReactionRepository } from '../Reaction/reactionRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { ReactionEntity } from '../Reaction/Reaction.Entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
    private readonly imageRepository: ImagesRepository,
    @InjectRepository(ReactionEntity)
    private readonly reactionRepositoryTypeOrm: Repository<ReactionEntity>,
  ) {}

  async createNewPost(
    createPostDto: CreatePostDTO,
    blogId: string,
  ): Promise<PostViewModel> {
    const blog = await this.blogRepository.getBlog(blogId);
    if (!blog) {
      throw new BadRequestException('blogId not found for blog /postService');
    }
    const post: Post = {
      id: randomUUID(),
      userId: blog.userId,
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
      vision: true,
    };
    await this.postRepository.createPost(post);
    // const postEntity: PostEntity = {
    //     id: post.id,
    //     userId: blog.userId,
    //     title: createPostDto.title,
    //     shortDescription: createPostDto.shortDescription,
    //     content: createPostDto.content,
    //     blogId: blogId,
    //     blogName: blog.name,
    //     createdAt: new Date().toISOString(),
    //   myStatus:post.extendedLikesInfo.myStatus,
    //   likesCount:post.extendedLikesInfo.likesCount,
    //   dislikesCount:post.extendedLikesInfo.dislikesCount,
    //   vision:post.vision,
    // };
    const outputPostModel = mapObject.mapPostFromViewModel(<PostEntity>{
      id: post.id,
      userId: blog.userId,
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blogId,
      blogName: blog.name,
      createdAt: post.createdAt,
      myStatus: post.extendedLikesInfo.myStatus,
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      vision: post.vision,
    });
    return outputPostModel;
  }
  async getPost(postId: string): Promise<PostViewModel> {
    const post = await this.postRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const imageMain =
      await this.imageRepository.getImageForPostByLimitAndPurpose(
        post.id,
        countMainImageForPost,
        ImagePurpose.main,
      );

    const limitLike = 3;
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
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
      .getMany();

    const postEntity = new PostEntity();
    postEntity.id = post.id;
    postEntity.userId = post.userId;
    postEntity.title = post.title;
    postEntity.shortDescription = post.shortDescription;
    postEntity.content = post.content;
    postEntity.blogId = post.blogId;
    postEntity.blogName = post.blogName;
    postEntity.createdAt = post.createdAt;
    postEntity.likesCount = post.extendedLikesInfo.likesCount;
    postEntity.dislikesCount = post.extendedLikesInfo.dislikesCount;
    postEntity.myStatus = post.extendedLikesInfo.myStatus;
    postEntity.vision = post.vision;

    const outputPost = mapObject.mapPostFromViewModel(
      postEntity,
      mapObject.mapNewestLikesFromSql(tableNewestLike),
      imageMain,
    );

    return outputPost;
  }
}
