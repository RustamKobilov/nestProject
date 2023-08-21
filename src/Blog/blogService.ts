import { BlogRepository } from './blogRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  CreatePostByBlogDTO,
  PaginationDTO,
} from '../DTO';
import { Blog } from './Blog';
import { randomUUID } from 'crypto';
import { mapObject } from '../mapObject';
import { BlogViewModel } from '../viewModelDTO';
import { helper } from '../helper';
import { PostService } from '../Post/postService';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly postService: PostService,
  ) {}

  async createNewBlog(createBlogDto: CreateBlogDTO): Promise<BlogViewModel> {
    //await this.blogRepository.checkDuplicateName(createBlogDto.name);

    const blog: Blog = {
      id: randomUUID(),
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await this.blogRepository.createBlog(blog);
    const outputBlogModel = mapObject.mapBlogForViewModel(blog);
    return outputBlogModel;
  }

  async getBlog(blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogRepository.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const outputBlogModel = mapObject.mapBlogForViewModel(blog);
    return outputBlogModel;
  }

  async getBlogs(blogPagination: BlogPaginationDTO) {
    const pagination = helper.getBlogPaginationValues(blogPagination);
    const searchNameTermFilter =
      this.blogRepository.getFilterBlog(blogPagination);
    return this.blogRepository.getBlogs(pagination, searchNameTermFilter);
  }

  async updateBlog(blogId: string, updateBlogDto: CreateBlogDTO) {
    const blog = await this.blogRepository.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const updateBlog = await this.blogRepository.updateBlog(
      blogId,
      updateBlogDto,
    );
    if (!updateBlog) {
      throw new NotFoundException('blog not update /blogService');
    }
    return;
  }

  async deleteBlog(blogId: string) {
    const blog = await this.blogRepository.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    return this.blogRepository.deleteBlog(blogId);
  }
  async getPostsbyBlog(blogId: string, postPagination: PaginationDTO) {
    const blog = await this.blogRepository.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const pagination = helper.getPostPaginationValues(postPagination);
    const filter = { blogId: blogId };
    return this.postService.getPostsByBlog(pagination, filter);
  }
  async createPostByBlog(createPostDto: CreatePostByBlogDTO, blogId: string) {
    const blog = await this.blogRepository.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const postByBlog = { ...createPostDto, blogId };
    return this.postService.createNewPost(postByBlog);
  }
  async getPostForBlogUser(
    blogId: string,
    getPagination: PaginationDTO,
    userId: string,
  ) {
    return await this.postService.getPostForBlogUser(
      blogId,
      getPagination,
      userId,
    );
  }
}
