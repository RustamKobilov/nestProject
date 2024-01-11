import { BlogRepository } from './blogRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { mapObject } from '../mapObject';
import { BlogViewModel } from '../viewModelDTO';
import { PostService } from '../Post/postService';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  // async getBlog(blogId: string): Promise<BlogViewModel> {
  //   const blog = await this.blogRepository.getBlog(blogId);
  //   if (!blog) {
  //     throw new NotFoundException('blogId not found for blog /blogService');
  //   }
  //   const outputBlogModel = mapObject.mapBlogForViewModel(blog);
  //   return outputBlogModel;
  // }
}
