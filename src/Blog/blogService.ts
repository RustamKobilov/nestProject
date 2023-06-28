import { BlogRepository } from './blogRepository';
import { Injectable } from '@nestjs/common';
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
import { PostRepository } from '../Post/postRepository';
import { PostService } from '../Post/postService';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly postRepository: PostRepository,
    private readonly postService: PostService,
  ) {}

  async createNewBlog(createBlogDto: CreateBlogDTO): Promise<BlogViewModel> {
    //await this.blogRepository.checkDuplicateName(createBlogDto.name);
    //rthjrhrehthh4h4h4
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
    return this.blogRepository.updateBlog(blogId, updateBlogDto);
  }

  async deleteBlog(blogId: string) {
    await this.blogRepository.getBlog(blogId);
    return this.blogRepository.deleteBlog(blogId);
  }
  async getPostsbyBlog(blogId: string, postPagination: PaginationDTO) {
    await this.blogRepository.getBlog(blogId);
    const pagination = helper.getPostPaginationValues(postPagination);
    const filter = { blogId: blogId };
    return this.postRepository.getPosts(pagination, filter);
  }
  async createPostByBlog(createPostDto: CreatePostByBlogDTO, blogId: string) {
    await this.blogRepository.getBlog(blogId);
    const postByBlog = { ...createPostDto, blogId };
    return this.postService.createNewPost(postByBlog);
  }
}
